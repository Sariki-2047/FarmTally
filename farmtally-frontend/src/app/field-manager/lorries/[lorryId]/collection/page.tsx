"use client";

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Truck, ArrowLeft, Plus, User, Package, Droplets, Trash2, Save, Send, Zap } from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { FastBagEntry } from "@/components/delivery/fast-bag-entry";

interface Farmer {
  id: string;
  name: string;
  phone: string;
  address?: string;
}

interface BagEntry {
  id: string;
  bagNumber: number;
  weight: number;
}

interface FarmerDelivery {
  id: string;
  farmer: Farmer;
  bags: BagEntry[];
  moistureContent: number;
  totalWeight: number;
  notes?: string;
}

export default function LorryCollectionPage() {
  const params = useParams();
  const router = useRouter();
  const lorryId = params.lorryId as string;
  const { user } = useAuthStore();

  const [lorry, setLorry] = useState<any>(null);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [deliveries, setDeliveries] = useState<FarmerDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add farmer dialog state
  const [addFarmerDialog, setAddFarmerDialog] = useState(false);
  const [selectedFarmerId, setSelectedFarmerId] = useState("");
  
  // Fast bag entry state
  const [fastBagEntryDialog, setFastBagEntryDialog] = useState(false);
  const [currentDeliveryId, setCurrentDeliveryId] = useState("");

  useEffect(() => {
    fetchLorryDetails();
    fetchFarmers();
  }, [lorryId]);

  const fetchLorryDetails = async () => {
    try {
      // This would fetch lorry details and existing deliveries
      // For now, we'll simulate lorry data
      setLorry({
        id: lorryId,
        plateNumber: "AP39T1234",
        capacity: 25,
        location: "Test Village",
        status: "ASSIGNED"
      });
    } catch (error) {
      console.error('Error fetching lorry details:', error);
      toast.error('Failed to fetch lorry details');
    } finally {
      setLoading(false);
    }
  };

  const fetchFarmers = async () => {
    try {
      const response = await apiClient.getFarmers();
      if (response.success) {
        setFarmers(response.data.farmers || []);
      }
    } catch (error) {
      console.error('Error fetching farmers:', error);
    }
  };

  const addFarmerToLorry = async () => {
    if (!selectedFarmerId) {
      toast.error("Please select a farmer");
      return;
    }

    const farmer = farmers.find(f => f.id === selectedFarmerId);
    if (!farmer) return;

    // Check if farmer already added
    if (deliveries.find(d => d.farmer.id === selectedFarmerId)) {
      toast.error("Farmer already added to this lorry");
      return;
    }

    // Add farmer to local state only - will be submitted to backend later
    const newDelivery: FarmerDelivery = {
      id: `delivery_${Date.now()}`,
      farmer,
      bags: [],
      moistureContent: 0,
      totalWeight: 0,
      notes: ""
    };

    setDeliveries(prev => [...prev, newDelivery]);
    setAddFarmerDialog(false);
    setSelectedFarmerId("");
    toast.success(`${farmer.name} added to lorry`);
  };

  const openFastBagEntry = (deliveryId: string) => {
    setCurrentDeliveryId(deliveryId);
    setFastBagEntryDialog(true);
  };

  const handleBagsUpdate = (bags: BagEntry[]) => {
    setDeliveries(prev => prev.map(d => {
      if (d.id === currentDeliveryId) {
        return {
          ...d,
          bags: bags,
          totalWeight: bags.reduce((sum, bag) => sum + bag.weight, 0)
        };
      }
      return d;
    }));
  };

  const updateMoistureContent = (deliveryId: string, moisture: number) => {
    setDeliveries(prev => prev.map(d => 
      d.id === deliveryId ? { ...d, moistureContent: moisture } : d
    ));
  };

  const removeBag = (deliveryId: string, bagId: string) => {
    setDeliveries(prev => prev.map(d => {
      if (d.id === deliveryId) {
        const updatedBags = d.bags.filter(bag => bag.id !== bagId);
        return {
          ...d,
          bags: updatedBags,
          totalWeight: updatedBags.reduce((sum, bag) => sum + bag.weight, 0)
        };
      }
      return d;
    }));
    toast.success("Bag removed");
  };

  const removeFarmer = (deliveryId: string) => {
    setDeliveries(prev => prev.filter(d => d.id !== deliveryId));
    toast.success("Farmer removed from lorry");
  };

  const submitCollection = async () => {
    if (deliveries.length === 0) {
      toast.error("Please add at least one farmer before submitting");
      return;
    }

    // Validate that all farmers have bags
    const farmersWithoutBags = deliveries.filter(d => d.bags.length === 0);
    if (farmersWithoutBags.length > 0) {
      toast.error(`Please add bags for all farmers. ${farmersWithoutBags.length} farmers have no bags.`);
      return;
    }

    try {
      console.log('Starting collection submission...');
      
      // Clear any existing pending deliveries for this lorry first
      try {
        await apiClient.clearPendingDeliveries(lorryId);
        console.log('Cleared pending deliveries');
      } catch (clearError) {
        console.log('No pending deliveries to clear or error clearing:', clearError);
      }
      
      // Submit each delivery to the backend
      for (const delivery of deliveries) {
        const deliveryData = {
          deliveryDate: new Date().toISOString(),
          bagsCount: delivery.bags.length,
          individualWeights: delivery.bags.map(bag => bag.weight),
          moistureContent: delivery.moistureContent,
          notes: delivery.notes || ""
        };

        console.log(`Submitting delivery for farmer ${delivery.farmer.name}:`, deliveryData);
        const response = await apiClient.addFarmerToLorry(lorryId, delivery.farmer.id, deliveryData);
        console.log('Delivery response:', response);
      }

      // Submit the lorry for processing
      console.log('Submitting lorry for processing...');
      const submitResponse = await apiClient.submitLorryForProcessing(lorryId);
      console.log('Submit response:', submitResponse);

      toast.success("Collection submitted successfully!");
      router.push("/field-manager/deliveries");
    } catch (error: any) {
      console.error('Error submitting collection:', error);
      const errorMessage = error?.message || error?.response?.data?.error || "Failed to submit collection. Please try again.";
      toast.error(errorMessage);
    }
  };



  const getTotalWeight = () => {
    return deliveries.reduce((sum, delivery) => sum + delivery.totalWeight, 0);
  };

  const getTotalBags = () => {
    return deliveries.reduce((sum, delivery) => sum + delivery.bags.length, 0);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/field-manager/lorries">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Lorries
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Truck className="h-6 w-6" />
              {lorry?.plateNumber} - Collection
            </h1>
            <p className="text-gray-600">Record corn deliveries from farmers</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Farmers</p>
                  <p className="text-2xl font-bold">{deliveries.length}</p>
                </div>
                <User className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Bags</p>
                  <p className="text-2xl font-bold">{getTotalBags()}</p>
                </div>
                <Package className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Weight</p>
                  <p className="text-2xl font-bold">{getTotalWeight().toFixed(1)} kg</p>
                </div>
                <Package className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Capacity Used</p>
                  <p className="text-2xl font-bold">
                    {((getTotalWeight() / (lorry?.capacity * 1000)) * 100).toFixed(1)}%
                  </p>
                </div>
                <Truck className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Farmer Button */}
      <div className="mb-6">
        <Dialog open={addFarmerDialog} onOpenChange={setAddFarmerDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Farmer to Lorry
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Farmer to Lorry</DialogTitle>
              <DialogDescription>
                Select a farmer to add to this lorry for corn collection.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="farmer">Select Farmer</Label>
                <Select value={selectedFarmerId} onValueChange={setSelectedFarmerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a farmer" />
                  </SelectTrigger>
                  <SelectContent>
                    {farmers.map((farmer) => (
                      <SelectItem key={farmer.id} value={farmer.id}>
                        {farmer.name} - {farmer.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddFarmerDialog(false)}>
                Cancel
              </Button>
              <Button onClick={addFarmerToLorry}>
                Add Farmer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Deliveries Table */}
      {deliveries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No farmers added yet</h3>
            <p className="text-gray-500 text-center mb-4">
              Add farmers to this lorry to start recording corn deliveries.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Farmer Deliveries</CardTitle>
            <CardDescription>
              Record bag weights and moisture content for each farmer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Farmer</TableHead>
                  <TableHead>Bags Count</TableHead>
                  <TableHead>Total Weight (kg)</TableHead>
                  <TableHead>Moisture %</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveries.map((delivery) => (
                  <TableRow key={delivery.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{delivery.farmer.name}</p>
                        <p className="text-sm text-gray-500">{delivery.farmer.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {delivery.bags.length} bags
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {delivery.totalWeight.toFixed(1)} kg
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="0.0"
                          value={delivery.moistureContent || ""}
                          onChange={(e) => updateMoistureContent(delivery.id, parseFloat(e.target.value) || 0)}
                          className="w-20"
                          step="0.1"
                          min="0"
                          max="100"
                        />
                        <Droplets className="h-4 w-4 text-blue-500" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => openFastBagEntry(delivery.id)}
                          className="bg-yellow-600 hover:bg-yellow-700"
                        >
                          <Zap className="h-4 w-4 mr-1" />
                          Fast Entry
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFarmer(delivery.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Fast Bag Entry Dialog */}
      {currentDeliveryId && (
        <FastBagEntry
          open={fastBagEntryDialog}
          onOpenChange={setFastBagEntryDialog}
          farmerName={deliveries.find(d => d.id === currentDeliveryId)?.farmer.name || ""}
          existingBags={deliveries.find(d => d.id === currentDeliveryId)?.bags || []}
          onBagsUpdate={handleBagsUpdate}
        />
      )}

      {/* Submit Collection */}
      {deliveries.length > 0 && (
        <div className="mt-6 flex justify-end gap-4">
          <Button variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={submitCollection}>
            <Send className="h-4 w-4 mr-2" />
            Submit Collection
          </Button>
        </div>
      )}
    </div>
  );
}