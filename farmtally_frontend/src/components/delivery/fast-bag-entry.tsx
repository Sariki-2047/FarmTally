"use client";

import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, Zap, Package } from "lucide-react";
import { toast } from "sonner";

interface BagEntry {
  id: string;
  bagNumber: number;
  weight: number;
}

interface FastBagEntryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farmerName: string;
  existingBags: BagEntry[];
  onBagsUpdate: (bags: BagEntry[]) => void;
}

export function FastBagEntry({ 
  open, 
  onOpenChange, 
  farmerName, 
  existingBags, 
  onBagsUpdate 
}: FastBagEntryProps) {
  const [bags, setBags] = useState<BagEntry[]>(existingBags);
  const [currentWeight, setCurrentWeight] = useState("");
  const [isRapidMode, setIsRapidMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setBags(existingBags);
  }, [existingBags]);

  useEffect(() => {
    if (open && inputRef.current) {
      // Focus input when dialog opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const addBag = () => {
    if (!currentWeight || parseFloat(currentWeight) <= 0) {
      toast.error("Please enter a valid weight");
      inputRef.current?.focus();
      return;
    }

    const weight = parseFloat(currentWeight);
    const newBag: BagEntry = {
      id: `bag_${Date.now()}_${Math.random()}`,
      bagNumber: bags.length + 1,
      weight: weight
    };

    const updatedBags = [...bags, newBag];
    setBags(updatedBags);
    setCurrentWeight("");
    
    toast.success(`Bag ${newBag.bagNumber}: ${weight} kg added`, {
      duration: 1000,
    });

    // Auto-focus for rapid entry
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 50);
  };

  const removeBag = (bagId: string) => {
    const updatedBags = bags.filter(bag => bag.id !== bagId);
    // Renumber bags
    const renumberedBags = updatedBags.map((bag, index) => ({
      ...bag,
      bagNumber: index + 1
    }));
    setBags(renumberedBags);
    toast.success("Bag removed");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addBag();
    }
  };

  const saveBags = () => {
    onBagsUpdate(bags);
    onOpenChange(false);
    toast.success(`${bags.length} bags saved for ${farmerName}`);
  };

  const getTotalWeight = () => {
    return bags.reduce((sum, bag) => sum + bag.weight, 0);
  };

  const addMultipleBags = () => {
    const weight = parseFloat(currentWeight);
    if (!weight || weight <= 0) {
      toast.error("Please enter a valid weight");
      return;
    }

    // Add 5 bags with the same weight for rapid entry
    const newBags: BagEntry[] = [];
    for (let i = 0; i < 5; i++) {
      newBags.push({
        id: `bag_${Date.now()}_${i}`,
        bagNumber: bags.length + i + 1,
        weight: weight
      });
    }

    const updatedBags = [...bags, ...newBags];
    setBags(updatedBags);
    setCurrentWeight("");
    
    toast.success(`5 bags of ${weight} kg each added`, {
      duration: 1500,
    });

    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Fast Bag Entry - {farmerName}
          </DialogTitle>
          <DialogDescription>
            Enter bag weights quickly. Press Enter to add each bag or use rapid mode for multiple bags.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-hidden">
          {/* Input Section */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="weight">Bag Weight (kg)</Label>
                <Input
                  ref={inputRef}
                  id="weight"
                  type="number"
                  placeholder="Enter weight"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(e.target.value)}
                  onKeyPress={handleKeyPress}
                  step="0.1"
                  min="0.1"
                  max="100"
                  className="text-lg font-medium"
                />
              </div>
              <Button onClick={addBag} className="px-6">
                <Plus className="h-4 w-4 mr-2" />
                Add Bag
              </Button>
              <Button onClick={addMultipleBags} variant="outline" className="px-4">
                Add 5x
              </Button>
            </div>

            {/* Summary */}
            <div className="flex gap-4 text-sm">
              <Badge variant="outline" className="px-3 py-1">
                {bags.length} bags
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                Total: {getTotalWeight().toFixed(1)} kg
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                Avg: {bags.length > 0 ? (getTotalWeight() / bags.length).toFixed(1) : 0} kg/bag
              </Badge>
            </div>
          </div>

          {/* Bags List */}
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Bags ({bags.length})</h4>
              {bags.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setBags([])}
                >
                  Clear All
                </Button>
              )}
            </div>
            
            <div className="max-h-64 overflow-y-auto border rounded-lg">
              {bags.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No bags added yet</p>
                  <p className="text-sm">Enter weight above and press Enter</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4">
                  {bags.map((bag) => (
                    <div
                      key={bag.id}
                      className="flex items-center justify-between p-2 bg-white border rounded text-sm"
                    >
                      <span className="font-medium">
                        Bag {bag.bagNumber}
                      </span>
                      <span className="text-gray-600">
                        {bag.weight} kg
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeBag(bag.id)}
                        className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div className="text-sm text-gray-500">
            💡 Tip: Press Enter to quickly add bags
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={saveBags} disabled={bags.length === 0}>
              <Save className="h-4 w-4 mr-2" />
              Save {bags.length} Bags
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}