import { prisma } from '../lib/prisma';

export interface CreateDeliveryData {
    lorryId: string;
    farmerId: string;
    deliveryDate: Date;
    bagsCount: number;
    individualWeights: number[];
    moistureContent: number;
    qualityGrade?: 'A' | 'B' | 'C' | 'D' | 'REJECTED';
    photos?: string[];
    notes?: string;
}

export interface UpdateDeliveryData {
    bagsCount?: number;
    individualWeights?: number[];
    moistureContent?: number;
    qualityGrade?: 'A' | 'B' | 'C' | 'D' | 'REJECTED';
    qualityDeduction?: number;
    pricePerKg?: number;
    photos?: string[];
    notes?: string;
}

export interface SetQualityDeductionData {
    qualityDeduction: number;
    standardDeduction: number;
    qualityGrade: 'A' | 'B' | 'C' | 'D' | 'REJECTED';
}

export interface SetPricingData {
    pricePerKg: number;
}

export class DeliveryService {

    /**
     * Add farmer to lorry with delivery details
     */
    async addFarmerToLorry(
        lorryId: string,
        farmerId: string,
        userId: string,
        organizationId: string,
        data: CreateDeliveryData
    ) {
        // 1. Verify lorry exists and is available
        const lorry = await prisma.lorry.findFirst({
            where: {
                id: lorryId,
                organizationId: organizationId
            }
        });

        if (!lorry) {
            throw new Error('Lorry not found');
        }

        if (lorry.status === 'SENT_TO_DEALER') {
            throw new Error('Cannot add farmers to lorry that has been sent to dealer');
        }

        // 2. Verify farmer exists in organization
        const farmer = await prisma.farmer.findFirst({
            where: {
                id: farmerId,
                organizationId: organizationId,
                isActive: true
            }
        });

        if (!farmer) {
            throw new Error('Farmer not found in your organization');
        }

        // 3. Check if farmer is already added to this lorry with pending status
        const existingDelivery = await prisma.delivery.findFirst({
            where: {
                lorryId: lorryId,
                farmerId: farmerId,
                status: { in: ['PENDING', 'IN_PROGRESS'] }
            }
        });

        if (existingDelivery) {
            // If there's an existing pending delivery, delete it and create a new one
            // This handles cases where the frontend is resubmitting data
            await prisma.delivery.delete({
                where: { id: existingDelivery.id }
            });
        }

        // 4. Validate business rules
        if (data.individualWeights.length !== data.bagsCount) {
            throw new Error('Number of individual weights must match bags count');
        }

        if (data.bagsCount <= 0) {
            throw new Error('Bags count must be greater than 0');
        }

        if (data.moistureContent < 0 || data.moistureContent > 100) {
            throw new Error('Moisture content must be between 0 and 100');
        }

        // 5. Calculate weights and deductions
        const grossWeight = data.individualWeights.reduce((sum, weight) => sum + weight, 0);
        const standardDeduction = this.calculateStandardDeduction(data.bagsCount, data.moistureContent);
        const qualityDeduction = 0;
        const netWeight = grossWeight - standardDeduction - qualityDeduction;

        // 6. Get farmer's current advance balance
        const advanceBalance = await this.getFarmerAdvanceBalance(farmerId, organizationId);

        // 7. Create delivery record
        const delivery = await prisma.delivery.create({
            data: {
                organizationId: organizationId,
                lorryId: lorryId,
                farmerId: farmerId,
                fieldManagerId: userId,

                // Weight and Quality
                bagsCount: data.bagsCount,
                individualWeights: data.individualWeights,
                grossWeight: grossWeight,
                moistureContent: data.moistureContent,
                qualityGrade: data.qualityGrade || 'A',
                standardDeduction: standardDeduction,
                qualityDeduction: qualityDeduction,
                netWeight: netWeight,

                // Financial
                advanceAmount: advanceBalance,
                interestCharges: 0,

                // Status and Timing
                status: 'PENDING',
                deliveryDate: data.deliveryDate,
                deliveredAt: data.deliveryDate,

                // Additional
                photos: data.photos || [],
                notes: data.notes
            },
            include: {
                farmer: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        address: true
                    }
                },
                lorry: {
                    select: {
                        id: true,
                        plateNumber: true,
                        capacity: true
                    }
                },
                fieldManager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });

        // 8. Update lorry status if this is the first delivery
        const deliveryCount = await prisma.delivery.count({
            where: { lorryId: lorryId }
        });

        if (deliveryCount === 1) {
            await prisma.lorry.update({
                where: { id: lorryId },
                data: { status: 'LOADING' }
            });
        }

        return delivery;
    }

    /**
     * Get all deliveries for a lorry
     */
    async getLorryDeliveries(lorryId: string, organizationId: string) {
        const deliveries = await prisma.delivery.findMany({
            where: {
                lorryId: lorryId,
                organizationId: organizationId
            },
            include: {
                farmer: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        address: true
                    }
                },
                lorry: {
                    select: {
                        id: true,
                        plateNumber: true,
                        capacity: true,
                        status: true
                    }
                },
                fieldManager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return deliveries;
    }

    /**
     * Get all deliveries for an organization (Farm Admin)
     */
    async getOrganizationDeliveries(organizationId: string) {
        const deliveries = await prisma.delivery.findMany({
            where: {
                organizationId: organizationId
            },
            include: {
                farmer: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        address: true
                    }
                },
                lorry: {
                    select: {
                        id: true,
                        plateNumber: true,
                        capacity: true,
                        status: true
                    }
                },
                fieldManager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return deliveries;
    }

    /**
     * Get deliveries for a specific field manager
     */
    async getFieldManagerDeliveries(fieldManagerId: string, organizationId: string) {
        const deliveries = await prisma.delivery.findMany({
            where: {
                fieldManagerId: fieldManagerId,
                organizationId: organizationId
            },
            include: {
                farmer: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        address: true
                    }
                },
                lorry: {
                    select: {
                        id: true,
                        plateNumber: true,
                        capacity: true,
                        status: true
                    }
                },
                fieldManager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return deliveries;
    }

    /**
     * Update delivery details (before submission)
     */
    async updateDelivery(
        deliveryId: string,
        data: UpdateDeliveryData,
        userId: string,
        organizationId: string
    ) {
        const delivery = await prisma.delivery.findFirst({
            where: {
                id: deliveryId,
                organizationId: organizationId
            }
        });

        if (!delivery) {
            throw new Error('Delivery not found');
        }

        // Check if user has permission to update this delivery
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });

        if (!user) {
            throw new Error('User not found');
        }

        // Field managers can only update their own deliveries, and only if pending
        if (user.role === 'FIELD_MANAGER') {
            if (delivery.fieldManagerId !== userId) {
                throw new Error('Access denied - you can only update your own deliveries');
            }
            if (delivery.status !== 'PENDING') {
                throw new Error('Can only update pending deliveries');
            }
        }

        // Farm admins can update any delivery in their organization (including submitted ones for pricing/quality)
        if (user.role !== 'FIELD_MANAGER' && user.role !== 'FARM_ADMIN') {
            throw new Error('Access denied');
        }

        // Recalculate weights and financial totals
        let updateData: any = { ...data };

        // If individual weights changed, recalculate gross weight and deductions
        if (data.individualWeights && data.bagsCount) {
            if (data.individualWeights.length !== data.bagsCount) {
                throw new Error('Number of individual weights must match bags count');
            }

            const grossWeight = data.individualWeights.reduce((sum, weight) => sum + weight, 0);
            const moistureValue = data.moistureContent || Number(delivery.moistureContent || 0);
            const standardDeduction = this.calculateStandardDeduction(data.bagsCount, moistureValue);
            const qualityDeduction = data.qualityDeduction !== undefined ? data.qualityDeduction : Number(delivery.qualityDeduction || 0);

            updateData = {
                ...updateData,
                grossWeight,
                standardDeduction,
                netWeight: grossWeight - standardDeduction - qualityDeduction
            };
        }

        // If quality deduction changed, recalculate net weight
        if (data.qualityDeduction !== undefined) {
            const grossWeight = Number(delivery.grossWeight || 0);
            const standardDeduction = Number(delivery.standardDeduction || 0);
            updateData.netWeight = grossWeight - standardDeduction - data.qualityDeduction;
        }

        // If price per kg is set, calculate financial totals
        if (data.pricePerKg !== undefined && data.pricePerKg > 0) {
            const netWeight = updateData.netWeight !== undefined ? updateData.netWeight : Number(delivery.netWeight || 0);
            const advanceAmount = Number(delivery.advanceAmount || 0);
            
            updateData.totalValue = netWeight * data.pricePerKg;
            updateData.finalAmount = updateData.totalValue - advanceAmount;
            updateData.processedAt = new Date();
        }

        // If this is a farm admin updating pricing/quality, check if lorry should be marked as processed
        if (user.role === 'FARM_ADMIN' && (data.pricePerKg !== undefined || data.qualityDeduction !== undefined)) {
            // Check if all deliveries in this lorry have been processed (have pricing set)
            const allDeliveries = await prisma.delivery.findMany({
                where: { lorryId: delivery.lorryId },
                select: { id: true, pricePerKg: true }
            });

            const processedDeliveries = allDeliveries.filter(d => (d.pricePerKg || 0) > 0);
            
            // If all deliveries have pricing set, update lorry status to PROCESSED
            if (processedDeliveries.length === allDeliveries.length) {
                await prisma.lorry.update({
                    where: { id: delivery.lorryId },
                    data: { 
                        status: 'PROCESSED',
                        processedAt: new Date()
                    }
                });

                // Update all deliveries to PROCESSED status
                await prisma.delivery.updateMany({
                    where: { lorryId: delivery.lorryId },
                    data: { status: 'PROCESSED' }
                });
            }
        }

        const updatedDelivery = await prisma.delivery.update({
            where: { id: deliveryId },
            data: updateData,
            include: {
                farmer: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        address: true
                    }
                },
                lorry: {
                    select: {
                        id: true,
                        plateNumber: true,
                        capacity: true
                    }
                },
                fieldManager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });

        return updatedDelivery;
    }

    /**
     * Set quality deduction for delivery (Farm Admin only)
     */
    async setQualityDeduction(
        deliveryId: string,
        data: SetQualityDeductionData,
        organizationId: string
    ) {
        const delivery = await prisma.delivery.findFirst({
            where: {
                id: deliveryId,
                organizationId: organizationId
            }
        });

        if (!delivery) {
            throw new Error('Delivery not found');
        }

        // Validate quality deduction amount
        if (data.qualityDeduction < 0) {
            throw new Error('Quality deduction cannot be negative');
        }

        if (data.qualityDeduction > Number(delivery.grossWeight)) {
            throw new Error('Quality deduction cannot exceed gross weight');
        }

        // Recalculate net weight with new quality deduction
        const netWeight = Number(delivery.grossWeight) - Number(delivery.standardDeduction || 0) - data.qualityDeduction;

        const updatedDelivery = await prisma.delivery.update({
            where: { id: deliveryId },
            data: {
                qualityDeduction: data.qualityDeduction,
                standardDeduction: data.standardDeduction,
                qualityGrade: data.qualityGrade,
                netWeight: netWeight,
                updatedAt: new Date()
            },
            include: {
                farmer: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        address: true
                    }
                },
                lorry: {
                    select: {
                        id: true,
                        plateNumber: true,
                        capacity: true
                    }
                },
                fieldManager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });

        return updatedDelivery;
    }

    /**
     * Set pricing for deliveries (Farm Admin only)
     */
    async setPricing(
        deliveryId: string,
        data: SetPricingData,
        organizationId: string
    ) {
        const delivery = await prisma.delivery.findFirst({
            where: {
                id: deliveryId,
                organizationId: organizationId
            }
        });

        if (!delivery) {
            throw new Error('Delivery not found');
        }

        // Get current total advance balance for this farmer
        const currentAdvanceBalance = await this.getFarmerAdvanceBalance(delivery.farmerId, organizationId);

        // Calculate financial details
        const totalValue = Number(delivery.netWeight) * data.pricePerKg;
        const interestCharges = this.calculateInterestCharges(currentAdvanceBalance);
        const finalAmount = totalValue - currentAdvanceBalance - interestCharges;

        const updatedDelivery = await prisma.delivery.update({
            where: { id: deliveryId },
            data: {
                pricePerKg: data.pricePerKg,
                totalValue: totalValue,
                advanceAmount: currentAdvanceBalance,
                interestCharges: interestCharges,
                finalAmount: finalAmount,
                processedAt: new Date()
            },
            include: {
                farmer: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        address: true
                    }
                },
                lorry: {
                    select: {
                        id: true,
                        plateNumber: true,
                        capacity: true
                    }
                },
                fieldManager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });

        return updatedDelivery;
    }

    /**
     * Clear pending deliveries for a lorry (used before resubmission)
     */
    async clearPendingDeliveries(lorryId: string, organizationId: string): Promise<void> {
        await prisma.delivery.deleteMany({
            where: {
                lorryId: lorryId,
                organizationId: organizationId,
                status: 'PENDING'
            }
        });
    }

    /**
     * Submit lorry for processing (Field Manager)
     */
    async submitLorry(lorryId: string, userId: string, organizationId: string): Promise<void> {
        // Verify lorry exists in organization
        const lorry = await prisma.lorry.findFirst({
            where: {
                id: lorryId,
                organizationId: organizationId
            }
        });

        if (!lorry) {
            throw new Error('Lorry not found');
        }

        // Check if user has deliveries on this lorry (alternative to direct assignment)
        const userDeliveries = await prisma.delivery.count({
            where: {
                lorryId: lorryId,
                fieldManagerId: userId
            }
        });

        if (userDeliveries === 0 && lorry.assignedManagerId !== userId) {
            throw new Error('Access denied - you have no deliveries on this lorry');
        }

        // Check if lorry has deliveries
        const deliveryCount = await prisma.delivery.count({
            where: { lorryId: lorryId }
        });

        if (deliveryCount === 0) {
            throw new Error('Cannot submit lorry without deliveries');
        }

        // Update lorry status to SUBMITTED
        await prisma.lorry.update({
            where: { id: lorryId },
            data: { 
                status: 'SUBMITTED',
                submittedAt: new Date()
            }
        });

        // Update all deliveries status to IN_PROGRESS (awaiting farm admin processing)
        await prisma.delivery.updateMany({
            where: { lorryId: lorryId },
            data: { 
                status: 'IN_PROGRESS',
                submittedAt: new Date()
            }
        });
    }

    /**
     * Mark lorry as sent to dealer (Farm Admin)
     */
    async markSentToDealer(lorryId: string, organizationId: string): Promise<void> {
        // Verify lorry exists and is processed
        const lorry = await prisma.lorry.findFirst({
            where: {
                id: lorryId,
                organizationId: organizationId
            }
        });

        if (!lorry) {
            throw new Error('Lorry not found');
        }

        if (lorry.status !== 'PROCESSED') {
            throw new Error('Lorry must be processed before sending to dealer');
        }

        // Update lorry status to final state
        await prisma.lorry.update({
            where: { id: lorryId },
            data: { 
                status: 'SENT_TO_DEALER',
                sentToDealerAt: new Date()
            }
        });

        // Update all deliveries to final COMPLETED status
        await prisma.delivery.updateMany({
            where: { lorryId: lorryId },
            data: { 
                status: 'COMPLETED',
                completedAt: new Date()
            }
        });
    }

    /**
     * Get delivery by ID
     */
    async getDeliveryById(deliveryId: string, organizationId: string) {
        const delivery = await prisma.delivery.findFirst({
            where: {
                id: deliveryId,
                organizationId: organizationId
            },
            include: {
                farmer: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        address: true
                    }
                },
                lorry: {
                    select: {
                        id: true,
                        plateNumber: true,
                        capacity: true
                    }
                },
                fieldManager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });

        if (!delivery) {
            throw new Error('Delivery not found');
        }

        return delivery;
    }

    /**
     * Delete delivery (before submission only)
     */
    async deleteDelivery(deliveryId: string, userId: string, organizationId: string): Promise<void> {
        const delivery = await prisma.delivery.findFirst({
            where: {
                id: deliveryId,
                organizationId: organizationId,
                fieldManagerId: userId
            }
        });

        if (!delivery) {
            throw new Error('Delivery not found or access denied');
        }

        if (delivery.status !== 'PENDING') {
            throw new Error('Can only delete pending deliveries');
        }

        await prisma.delivery.delete({
            where: { id: deliveryId }
        });

        // Check if this was the last delivery for the lorry
        const remainingDeliveries = await prisma.delivery.count({
            where: { lorryId: delivery.lorryId }
        });

        if (remainingDeliveries === 0) {
            // Reset lorry status to ASSIGNED
            await prisma.lorry.update({
                where: { id: delivery.lorryId },
                data: { status: 'ASSIGNED' }
            });
        }
    }

    /**
     * Get farmer's current advance balance
     */
    private async getFarmerAdvanceBalance(farmerId: string, organizationId: string): Promise<number> {
        const result = await prisma.advancePayment.aggregate({
            where: {
                farmerId: farmerId,
                organizationId: organizationId,
                status: 'COMPLETED'
            },
            _sum: {
                amount: true
            }
        });

        return Number(result._sum?.amount || 0);
    }

    /**
     * Calculate standard deduction based on number of bags
     */
    private calculateStandardDeduction(bagsCount: number, moistureContent: number): number {
        // Standard deduction: 2kg per bag
        let deduction = bagsCount * 2.0;

        // Additional deduction for high moisture content
        if (moistureContent > 14) {
            const excessMoisture = moistureContent - 14;
            deduction += bagsCount * (excessMoisture * 0.1);
        }

        return Math.round(deduction * 100) / 100;
    }

    /**
     * Calculate interest charges on advance payments
     */
    private calculateInterestCharges(advanceAmount: number): number {
        const interestRate = 0.02; // 2% per month
        return Math.round(advanceAmount * interestRate * 100) / 100;
    }
}

export const deliveryService = new DeliveryService();