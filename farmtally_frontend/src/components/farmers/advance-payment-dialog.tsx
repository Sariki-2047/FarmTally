"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IndianRupee, CreditCard } from "lucide-react";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

interface AdvancePaymentDialogProps {
  farmer: {
    id: string;
    name: string;
    phone: string;
  };
  trigger?: React.ReactNode;
  onPaymentAdded?: () => void;
}

export function AdvancePaymentDialog({ farmer, trigger, onPaymentAdded }: AdvancePaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    reference: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      const paymentData = {
        farmerId: farmer.id,
        amount: parseFloat(formData.amount),
        reference: formData.reference,
        notes: formData.notes,
        type: "ADVANCE",
        status: "COMPLETED"
      };

      const response = await apiClient.createAdvancePayment(paymentData);
      
      if (response.success) {
        toast.success(`Advance payment of ₹${formData.amount} recorded for ${farmer.name}`);
        setFormData({ amount: "", reference: "", notes: "" });
        setOpen(false);
        onPaymentAdded?.();
      } else {
        throw new Error(response.message || "Failed to record advance payment");
      }
    } catch (error) {
      console.error('Error recording advance payment:', error);
      toast.error("Failed to record advance payment");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline">
            <IndianRupee className="h-4 w-4 mr-1" />
            Add Advance
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-green-600" />
            Record Advance Payment
          </DialogTitle>
          <DialogDescription>
            Record an advance payment for {farmer.name} ({farmer.phone})
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹) *</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  placeholder="Enter amount"
                  className="pl-10"
                  step="0.01"
                  min="0.01"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reference">Reference Number</Label>
              <Input
                id="reference"
                value={formData.reference}
                onChange={(e) => handleInputChange("reference", e.target.value)}
                placeholder="Transaction reference (optional)"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Additional notes (optional)"
                rows={3}
              />
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex">
              <CreditCard className="w-5 h-5 text-blue-400 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Advance Payment Information
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>This amount will be deducted from final settlement</li>
                    <li>Interest may be calculated based on organization policy</li>
                    <li>Payment will be recorded immediately</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Recording..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}