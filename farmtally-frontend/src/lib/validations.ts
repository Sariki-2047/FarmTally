/**
 * Zod validation schemas for forms
 */

import { z } from 'zod';

// Authentication schemas
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  role: z.enum(['FARM_ADMIN', 'FIELD_MANAGER', 'FARMER']),
  organizationName: z.string().optional(),
});

// Farmer schemas
export const farmerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().optional(),
  bankAccount: z.string().optional(),
  idNumber: z.string().optional(),
});

// Lorry schemas
export const lorrySchema = z.object({
  plateNumber: z.string().min(3, 'Plate number must be at least 3 characters'),
  capacity: z.number().min(0.1, 'Capacity must be greater than 0'),
  assignedManagerId: z.string().optional(),
});

// Delivery schemas
export const deliverySchema = z.object({
  lorryId: z.string().min(1, 'Lorry is required'),
  farmerId: z.string().min(1, 'Farmer is required'),
  deliveryDate: z.date(),
  bagsCount: z.number().min(1, 'Number of bags must be at least 1'),
  individualWeights: z.array(z.number().min(0.1, 'Weight must be greater than 0')),
  moistureContent: z.number().min(0).max(100, 'Moisture content must be between 0 and 100'),
  qualityGrade: z.enum(['A', 'B', 'C', 'D', 'REJECTED']).optional(),
  photos: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

// Advance payment schemas
export const advancePaymentSchema = z.object({
  farmerId: z.string().min(1, 'Farmer is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  paymentDate: z.date(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

// Quality deduction schema
export const qualityDeductionSchema = z.object({
  qualityDeduction: z.number().min(0, 'Quality deduction cannot be negative'),
  standardDeduction: z.number().min(0, 'Standard deduction cannot be negative'),
  qualityGrade: z.enum(['A', 'B', 'C', 'D', 'REJECTED']),
});

// Pricing schema
export const pricingSchema = z.object({
  pricePerKg: z.number().min(0.01, 'Price per kg must be greater than 0'),
});

// Admin review schema
export const adminReviewSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  approved: z.boolean(),
  rejectionReason: z.string().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type FarmerFormData = z.infer<typeof farmerSchema>;
export type LorryFormData = z.infer<typeof lorrySchema>;
export type DeliveryFormData = z.infer<typeof deliverySchema>;
export type AdvancePaymentFormData = z.infer<typeof advancePaymentSchema>;
export type QualityDeductionFormData = z.infer<typeof qualityDeductionSchema>;
export type PricingFormData = z.infer<typeof pricingSchema>;
export type AdminReviewFormData = z.infer<typeof adminReviewSchema>;