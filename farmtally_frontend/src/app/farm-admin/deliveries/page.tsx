"use client";

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, User, Truck, Calendar, Search, Phone, IndianRupee, Eye, ChevronDown, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/lib/auth";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

interface Delivery {
  id: string;
  farmer: {
    name: string;
    phone: string;
  };
  lorry: {
    id: string;
    plateNumber: string;
    status?: string;
  };
  fieldManager: {
    firstName: string;
    lastName: string;
  };
  bagsCount: number;
  grossWeight?: number;
  standardDeduction?: number;
  qualityDeduction?: number;
  netWeight?: number;
  moistureContent?: number;
  qualityGrade?: string;
  advanceAmount?: number;
  pricePerKg?: number;
  totalValue?: number;
  finalAmount?: number;
  status: string;
  deliveryDate?: string;
  createdAt: string;
}

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [editingField, setEditingField] = useState<{deliveryId: string, field: string} | null>(null);
  const [tempValue, setTempValue] = useState<string>("");
  const [expandedLorries, setExpandedLorries] = useState<Set<string>>(new Set());
  const [groupByLorry, setGroupByLorry] = useState(true);
  const { } = useAuthStore();

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const response = await apiClient.getDeliveries();
      if (response.success) {
        setDeliveries(response.data || []);
      } else {
        throw new Error(response.error || 'Failed to fetch deliveries');
      }
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      toast.error('Failed to fetch deliveries');
    } finally {
      setLoading(false);
    }
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = 
      delivery.farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.lorry.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${delivery.fieldManager.firstName} ${delivery.fieldManager.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || delivery.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Group deliveries by lorry
  const groupedDeliveries = filteredDeliveries.reduce((groups, delivery) => {
    const lorryKey = delivery.lorry.plateNumber;
    if (!groups[lorryKey]) {
      groups[lorryKey] = {
        lorry: delivery.lorry,
        fieldManager: delivery.fieldManager,
        deliveries: [],
        totalBags: 0,
        totalGrossWeight: 0,
        totalNetWeight: 0,
        totalValue: 0,
        totalAdvance: 0,
        totalFinalAmount: 0,
      };
    }
    groups[lorryKey].deliveries.push(delivery);
    groups[lorryKey].totalBags += delivery.bagsCount;
    groups[lorryKey].totalGrossWeight += delivery.grossWeight || 0;
    groups[lorryKey].totalNetWeight += delivery.netWeight || 0;
    groups[lorryKey].totalValue += delivery.totalValue || 0;
    groups[lorryKey].totalAdvance += delivery.advanceAmount || 0;
    groups[lorryKey].totalFinalAmount += delivery.finalAmount || 0;
    return groups;
  }, {} as Record<string, any>);

  const toggleLorryExpansion = (lorryPlateNumber: string) => {
    const newExpanded = new Set(expandedLorries);
    if (newExpanded.has(lorryPlateNumber)) {
      newExpanded.delete(lorryPlateNumber);
    } else {
      newExpanded.add(lorryPlateNumber);
    }
    setExpandedLorries(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'PROCESSED': return 'bg-purple-100 text-purple-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLorryStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800';
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800';
      case 'LOADING': return 'bg-yellow-100 text-yellow-800';
      case 'IN_TRANSIT': return 'bg-orange-100 text-orange-800';
      case 'SUBMITTED': return 'bg-indigo-100 text-indigo-800';
      case 'PROCESSED': return 'bg-teal-100 text-teal-800';
      case 'SENT_TO_DEALER': return 'bg-purple-100 text-purple-800';
      case 'MAINTENANCE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLorryStatusOptions = (currentStatus: string) => {
    const allStatuses = ['AVAILABLE', 'ASSIGNED', 'LOADING', 'IN_TRANSIT', 'SUBMITTED', 'PROCESSED', 'SENT_TO_DEALER', 'MAINTENANCE'];
    
    // Define valid transitions based on current status
    const validTransitions: Record<string, string[]> = {
      'AVAILABLE': ['ASSIGNED', 'MAINTENANCE'],
      'ASSIGNED': ['AVAILABLE', 'LOADING', 'MAINTENANCE'],
      'LOADING': ['IN_TRANSIT', 'SUBMITTED', 'ASSIGNED', 'MAINTENANCE'],
      'IN_TRANSIT': ['SUBMITTED', 'LOADING', 'MAINTENANCE'],
      'SUBMITTED': ['PROCESSED', 'IN_TRANSIT', 'MAINTENANCE'],
      'PROCESSED': ['SENT_TO_DEALER', 'SUBMITTED', 'MAINTENANCE'],
      'SENT_TO_DEALER': ['AVAILABLE', 'MAINTENANCE'],
      'MAINTENANCE': ['AVAILABLE', 'ASSIGNED']
    };

    return validTransitions[currentStatus] || allStatuses;
  };

  const startEditing = (deliveryId: string, field: string, currentValue: number) => {
    setEditingField({ deliveryId, field });
    setTempValue(currentValue.toString());
  };

  const saveField = async (deliveryId: string, field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    
    try {
      const updateData: any = {};
      updateData[field] = numValue;
      
      await apiClient.updateDelivery(deliveryId, updateData);
      
      // Update local state with recalculated values
      setDeliveries(prev => prev.map(delivery => {
        if (delivery.id === deliveryId) {
          const updatedDelivery = { ...delivery, [field]: numValue };
          
          // Recalculate net weight if quality deduction changed
          if (field === 'qualityDeduction') {
            const grossWeight = updatedDelivery.grossWeight || 0;
            const standardDeduction = updatedDelivery.standardDeduction || 0;
            updatedDelivery.netWeight = grossWeight - standardDeduction - numValue;
          }
          
          // Recalculate financial totals if price per kg or quality deduction changed
          const netWeight = updatedDelivery.netWeight || 0;
          const pricePerKg = updatedDelivery.pricePerKg || 0;
          const advanceAmount = updatedDelivery.advanceAmount || 0;
          
          if (pricePerKg > 0) {
            updatedDelivery.totalValue = netWeight * pricePerKg;
            updatedDelivery.finalAmount = updatedDelivery.totalValue - advanceAmount;
          }
          
          return updatedDelivery;
        }
        return delivery;
      }));
      
      toast.success(`${field === 'qualityDeduction' ? 'Quality deduction' : 'Price per kg'} updated successfully`);
      
      // Refresh data to get updated status from backend
      fetchDeliveries();
    } catch (error) {
      console.error('Error updating delivery:', error);
      toast.error("Failed to update delivery");
    }
    
    setEditingField(null);
    setTempValue("");
  };

  const cancelEditing = () => {
    setEditingField(null);
    setTempValue("");
  };

  const updateLorryStatus = async (lorryId: string, newStatus: string) => {
    try {
      await apiClient.updateLorryStatus(lorryId, newStatus);
      toast.success(`Lorry status updated to ${newStatus.replace('_', ' ')}`);
      
      // Refresh deliveries to get updated lorry status
      fetchDeliveries();
      
      // Special handling for SENT_TO_DEALER status
      if (newStatus === 'SENT_TO_DEALER') {
        setTimeout(() => {
          if (confirm('Lorry has been sent to dealer. Would you like to make it available for the next delivery?')) {
            updateLorryStatus(lorryId, 'AVAILABLE');
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Error updating lorry status:', error);
      toast.error("Failed to update lorry status");
    }
  };

  const sendToDealer = async (lorryPlateNumber: string) => {
    // Find the lorry ID from the deliveries
    const delivery = deliveries.find(d => d.lorry.plateNumber === lorryPlateNumber);
    if (!delivery) return;

    try {
      await apiClient.sendLorryToDealer(delivery.lorry.plateNumber);
      toast.success(`Lorry ${lorryPlateNumber} marked as sent to dealer`);
      fetchDeliveries(); // Refresh data
    } catch (error) {
      console.error('Error sending lorry to dealer:', error);
      toast.error("Failed to send lorry to dealer");
    }
  };



  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="flex gap-4">
            <div className="h-10 bg-gray-200 rounded flex-1"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Deliveries</h1>
        <p className="text-gray-600">Monitor and manage corn deliveries across your organization</p>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by farmer, lorry, or field manager..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <Button
          variant={groupByLorry ? "default" : "outline"}
          onClick={() => setGroupByLorry(!groupByLorry)}
        >
          {groupByLorry ? "Show All" : "Group by Lorry"}
        </Button>
      </div>

      {filteredDeliveries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== "ALL" ? 'No deliveries found' : 'No deliveries yet'}
            </h3>
            <p className="text-gray-500 text-center mb-4">
              {searchTerm || statusFilter !== "ALL"
                ? 'Try adjusting your search or filter criteria.'
                : 'Deliveries will appear here once field managers start collecting corn from farmers.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedDeliveries).map(([lorryPlateNumber, group]) => (
              <Card key={lorryPlateNumber}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleLorryExpansion(lorryPlateNumber)}
                        className="p-1"
                      >
                        {expandedLorries.has(lorryPlateNumber) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <div className="flex items-center gap-2">
                        <Truck className="h-5 w-5 text-gray-600" />
                        <CardTitle className="text-lg">{lorryPlateNumber}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-gray-600">
                          {group.fieldManager.firstName} {group.fieldManager.lastName}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Select
                        value={group.lorry.status || 'AVAILABLE'}
                        onValueChange={(newStatus) => updateLorryStatus(group.lorry.id, newStatus)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue>
                            <Badge className={getLorryStatusColor(group.lorry.status || 'AVAILABLE')}>
                              {group.lorry.status || 'AVAILABLE'}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {getLorryStatusOptions(group.lorry.status || 'AVAILABLE').map((status) => (
                            <SelectItem key={status} value={status}>
                              <Badge className={getLorryStatusColor(status)}>
                                {status}
                              </Badge>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-6 gap-4 mt-3 text-sm">
                    <div>
                      <span className="text-gray-500">Total Bags:</span>
                      <div className="font-medium">{group.totalBags}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Gross Weight:</span>
                      <div className="font-medium">{group.totalGrossWeight.toLocaleString()} kg</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Net Weight:</span>
                      <div className="font-medium text-green-600">{group.totalNetWeight.toLocaleString()} kg</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Total Value:</span>
                      <div className="font-medium">₹{group.totalValue.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Advance:</span>
                      <div className="font-medium text-blue-600">₹{group.totalAdvance.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Final Amount:</span>
                      <div className="font-medium text-green-600">₹{group.totalFinalAmount.toLocaleString()}</div>
                    </div>
                  </div>
                </CardHeader>
                {expandedLorries.has(lorryPlateNumber) && (
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Farmer</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Bags</TableHead>
                            <TableHead>Gross Weight (kg)</TableHead>
                            <TableHead>Standard Deduction</TableHead>
                            <TableHead>Quality Deduction</TableHead>
                            <TableHead>Net Weight (kg)</TableHead>
                            <TableHead>Advance (₹)</TableHead>
                            <TableHead>Price/kg (₹)</TableHead>
                            <TableHead>Gross Total (₹)</TableHead>
                            <TableHead>Net Total (₹)</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {group.deliveries.map((delivery: Delivery) => (
                            <TableRow key={delivery.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  {delivery.deliveryDate ? new Date(delivery.deliveryDate).toLocaleDateString() : new Date(delivery.createdAt).toLocaleDateString()}
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-gray-400" />
                                  {delivery.farmer.name}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-gray-400" />
                                  {delivery.farmer.phone}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {delivery.bagsCount} bags
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">
                                {(delivery.grossWeight || 0).toLocaleString()}
                              </TableCell>
                              <TableCell className="text-orange-600">
                                -{(delivery.standardDeduction || 0)} kg
                              </TableCell>
                              <TableCell>
                                {editingField?.deliveryId === delivery.id && editingField?.field === 'qualityDeduction' ? (
                                  <div className="flex items-center gap-1">
                                    <Input
                                      type="number"
                                      value={tempValue}
                                      onChange={(e) => setTempValue(e.target.value)}
                                      onFocus={(e) => e.target.select()}
                                      onBlur={() => saveField(delivery.id, 'qualityDeduction', tempValue)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          saveField(delivery.id, 'qualityDeduction', tempValue);
                                        } else if (e.key === 'Escape') {
                                          cancelEditing();
                                        }
                                      }}
                                      className="w-16 h-6 text-xs"
                                      step="0.1"
                                      min="0"
                                      autoFocus
                                    />
                                    <span className="text-xs text-red-600">kg</span>
                                  </div>
                                ) : (
                                  <div 
                                    className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"
                                    onClick={() => startEditing(delivery.id, 'qualityDeduction', delivery.qualityDeduction || 0)}
                                  >
                                    {(delivery.qualityDeduction || 0) > 0 ? (
                                      <span className="text-red-600">-{delivery.qualityDeduction} kg</span>
                                    ) : (
                                      <span className="text-gray-400">0 kg (click to edit)</span>
                                    )}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="font-medium text-green-600">
                                {(delivery.netWeight || 0).toLocaleString()}
                              </TableCell>
                              <TableCell className="text-blue-600">
                                <div className="flex items-center gap-1">
                                  <IndianRupee className="h-3 w-3" />
                                  {(delivery.advanceAmount || 0).toLocaleString()}
                                </div>
                              </TableCell>
                              <TableCell>
                                {editingField?.deliveryId === delivery.id && editingField?.field === 'pricePerKg' ? (
                                  <div className="flex items-center gap-1">
                                    <IndianRupee className="h-3 w-3" />
                                    <Input
                                      type="number"
                                      value={tempValue}
                                      onChange={(e) => setTempValue(e.target.value)}
                                      onFocus={(e) => e.target.select()}
                                      onBlur={() => saveField(delivery.id, 'pricePerKg', tempValue)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          saveField(delivery.id, 'pricePerKg', tempValue);
                                        } else if (e.key === 'Escape') {
                                          cancelEditing();
                                        }
                                      }}
                                      className="w-16 h-6 text-xs"
                                      step="0.1"
                                      min="0"
                                      autoFocus
                                    />
                                  </div>
                                ) : (
                                  <div 
                                    className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"
                                    onClick={() => startEditing(delivery.id, 'pricePerKg', delivery.pricePerKg || 0)}
                                  >
                                    {(delivery.pricePerKg || 0) > 0 ? (
                                      <div className="flex items-center gap-1">
                                        <IndianRupee className="h-3 w-3" />
                                        {delivery.pricePerKg}
                                      </div>
                                    ) : (
                                      <span className="text-gray-400">Not set (click to edit)</span>
                                    )}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-1">
                                  <IndianRupee className="h-3 w-3" />
                                  {(delivery.totalValue || 0).toLocaleString()}
                                </div>
                              </TableCell>
                              <TableCell className="font-medium text-green-600">
                                <div className="flex items-center gap-1">
                                  <IndianRupee className="h-3 w-3" />
                                  {(delivery.finalAmount || 0).toLocaleString()}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(delivery.status)}>
                                  {delivery.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Button size="sm" variant="outline">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                )}
              </Card>
          ))}
        </div>
      )}

      {!groupByLorry && (
        <Card>
            <CardHeader>
              <CardTitle>All Deliveries</CardTitle>
              <CardDescription>
                Complete delivery records with financial calculations and quality management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lorry</TableHead>
                      <TableHead>Lorry Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Field Manager</TableHead>
                      <TableHead>Farmer</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Bags</TableHead>
                      <TableHead>Gross Weight (kg)</TableHead>
                      <TableHead>Standard Deduction</TableHead>
                      <TableHead>Quality Deduction</TableHead>
                      <TableHead>Net Weight (kg)</TableHead>
                      <TableHead>Advance (₹)</TableHead>
                      <TableHead>Price/kg (₹)</TableHead>
                      <TableHead>Gross Total (₹)</TableHead>
                      <TableHead>Net Total (₹)</TableHead>
                      <TableHead>Delivery Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDeliveries.map((delivery) => (
                      <TableRow key={delivery.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-gray-400" />
                            {delivery.lorry.plateNumber}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={delivery.lorry.status || 'AVAILABLE'}
                            onValueChange={(newStatus) => updateLorryStatus(delivery.lorry.id, newStatus)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue>
                                <Badge className={getLorryStatusColor(delivery.lorry.status || 'AVAILABLE')}>
                                  {delivery.lorry.status || 'AVAILABLE'}
                                </Badge>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {getLorryStatusOptions(delivery.lorry.status || 'AVAILABLE').map((status) => (
                                <SelectItem key={status} value={status}>
                                  <Badge className={getLorryStatusColor(status)}>
                                    {status}
                                  </Badge>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {delivery.deliveryDate ? new Date(delivery.deliveryDate).toLocaleDateString() : new Date(delivery.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-blue-600" />
                            {delivery.fieldManager.firstName} {delivery.fieldManager.lastName}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            {delivery.farmer.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            {delivery.farmer.phone}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {delivery.bagsCount} bags
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {(delivery.grossWeight || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-orange-600">
                          -{(delivery.standardDeduction || 0)} kg
                        </TableCell>
                        <TableCell>
                          {editingField?.deliveryId === delivery.id && editingField?.field === 'qualityDeduction' ? (
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                value={tempValue}
                                onChange={(e) => setTempValue(e.target.value)}
                                onFocus={(e) => e.target.select()}
                                onBlur={() => saveField(delivery.id, 'qualityDeduction', tempValue)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    saveField(delivery.id, 'qualityDeduction', tempValue);
                                  } else if (e.key === 'Escape') {
                                    cancelEditing();
                                  }
                                }}
                                className="w-16 h-6 text-xs"
                                step="0.1"
                                min="0"
                                autoFocus
                              />
                              <span className="text-xs text-red-600">kg</span>
                            </div>
                          ) : (
                            <div 
                              className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"
                              onClick={() => startEditing(delivery.id, 'qualityDeduction', delivery.qualityDeduction || 0)}
                            >
                              {(delivery.qualityDeduction || 0) > 0 ? (
                                <span className="text-red-600">-{delivery.qualityDeduction} kg</span>
                              ) : (
                                <span className="text-gray-400">0 kg (click to edit)</span>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium text-green-600">
                          {(delivery.netWeight || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-blue-600">
                          <div className="flex items-center gap-1">
                            <IndianRupee className="h-3 w-3" />
                            {(delivery.advanceAmount || 0).toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          {editingField?.deliveryId === delivery.id && editingField?.field === 'pricePerKg' ? (
                            <div className="flex items-center gap-1">
                              <IndianRupee className="h-3 w-3" />
                              <Input
                                type="number"
                                value={tempValue}
                                onChange={(e) => setTempValue(e.target.value)}
                                onFocus={(e) => e.target.select()}
                                onBlur={() => saveField(delivery.id, 'pricePerKg', tempValue)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    saveField(delivery.id, 'pricePerKg', tempValue);
                                  } else if (e.key === 'Escape') {
                                    cancelEditing();
                                  }
                                }}
                                className="w-16 h-6 text-xs"
                                step="0.1"
                                min="0"
                                autoFocus
                              />
                            </div>
                          ) : (
                            <div 
                              className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"
                              onClick={() => startEditing(delivery.id, 'pricePerKg', delivery.pricePerKg || 0)}
                            >
                              {(delivery.pricePerKg || 0) > 0 ? (
                                <div className="flex items-center gap-1">
                                  <IndianRupee className="h-3 w-3" />
                                  {delivery.pricePerKg}
                                </div>
                              ) : (
                                <span className="text-gray-400">Not set (click to edit)</span>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-1">
                            <IndianRupee className="h-3 w-3" />
                            {(delivery.totalValue || 0).toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-green-600">
                          <div className="flex items-center gap-1">
                            <IndianRupee className="h-3 w-3" />
                            {(delivery.finalAmount || 0).toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(delivery.status)}>
                            {delivery.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {delivery.status === 'IN_PROGRESS' && (
                              <Button size="sm" variant="outline">
                                Processing
                              </Button>
                            )}
                            {delivery.status === 'PROCESSED' && (
                              <Button 
                                size="sm"
                                onClick={() => sendToDealer(delivery.lorry.plateNumber)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Send to Dealer
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}