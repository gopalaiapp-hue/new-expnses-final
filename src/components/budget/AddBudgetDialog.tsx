import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Slider } from "../ui/slider";
import { useApp } from "../../lib/store";
import { Budget, EXPENSE_CATEGORIES, BudgetPeriod } from "../../types";
import { generateId } from "../../lib/utils";
import { toast } from "sonner@2.0.3";

interface AddBudgetDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AddBudgetDialog({ open, onClose }: AddBudgetDialogProps) {
  const { currentUser, currentFamily, addBudget, budgets } = useApp();
  const [category, setCategory] = useState<string>("");
  const [limitAmount, setLimitAmount] = useState("");
  const [period, setPeriod] = useState<BudgetPeriod>("monthly");
  const [thresholdPercent, setThresholdPercent] = useState([80]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter out categories that already have budgets
  const availableCategories = EXPENSE_CATEGORIES.filter(
    (cat) => !budgets.some((b) => b.category === cat && b.period === period)
  );

  const handleSubmit = async () => {
    if (!currentUser || !currentFamily) return;

    const amount = parseFloat(limitAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!category) {
      toast.error("Please select a category");
      return;
    }

    setIsSubmitting(true);
    try {
      const budget: Budget = {
        id: generateId(),
        family_id: currentFamily.id,
        category,
        limit_amount: amount,
        period,
        notify_threshold_percent: thresholdPercent[0],
        created_by_user_id: currentUser.id,
        created_at: new Date().toISOString(),
      };

      await addBudget(budget);
      toast.success("Budget created successfully");
      handleClose();
    } catch (error) {
      console.error("Failed to create budget:", error);
      toast.error("Failed to create budget");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCategory("");
    setLimitAmount("");
    setPeriod("monthly");
    setThresholdPercent([80]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Budget</DialogTitle>
          <DialogDescription>
            Set a spending limit for a category
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.length > 0 ? (
                  availableCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="_disabled" disabled>
                    All categories have budgets
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Period */}
          <div className="space-y-2">
            <Label htmlFor="period">Period *</Label>
            <Select value={period} onValueChange={(v) => setPeriod(v as BudgetPeriod)}>
              <SelectTrigger id="period">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Limit Amount */}
          <div className="space-y-2">
            <Label htmlFor="limitAmount">Limit Amount *</Label>
            <Input
              id="limitAmount"
              type="number"
              placeholder="0.00"
              value={limitAmount}
              onChange={(e) => setLimitAmount(e.target.value)}
              step="0.01"
            />
          </div>

          {/* Alert Threshold */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="threshold">Alert at {thresholdPercent[0]}%</Label>
              <span className="text-sm text-muted-foreground">
                {limitAmount && !isNaN(parseFloat(limitAmount))
                  ? `₹${((parseFloat(limitAmount) * thresholdPercent[0]) / 100).toFixed(2)}`
                  : "₹0.00"}
              </span>
            </div>
            <Slider
              id="threshold"
              value={thresholdPercent}
              onValueChange={setThresholdPercent}
              min={50}
              max={100}
              step={5}
            />
            <p className="text-xs text-muted-foreground">
              You'll be notified when spending reaches this percentage
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!category || !limitAmount || isSubmitting || availableCategories.length === 0}
              className="flex-1"
            >
              {isSubmitting ? "Creating..." : "Create Budget"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
