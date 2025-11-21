import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { useApp } from "../../lib/store";
import { DebtRecord, PaymentMethod } from "../../types";
import { formatCurrency } from "../../lib/utils";
import { toast } from "sonner@2.0.3";

interface SettleDebtDialogProps {
  debt: DebtRecord;
  open: boolean;
  onClose: () => void;
}

export function SettleDebtDialog({ debt, open, onClose }: SettleDebtDialogProps) {
  const { users, updateDebt } = useApp();
  const [settlementMethod, setSettlementMethod] = useState<PaymentMethod>("cash");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const lender = users.find((u) => u.id === debt.lender_user_id);

  const handleSettle = async () => {
    setIsSubmitting(true);
    try {
      const updatedDebt: DebtRecord = {
        ...debt,
        status: "settled",
        settled_at: new Date().toISOString(),
        settlement_method: settlementMethod,
      };

      await updateDebt(updatedDebt);
      toast.success("IOU marked as settled");
      onClose();
    } catch (error) {
      console.error("Failed to settle debt:", error);
      toast.error("Failed to settle IOU");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Settle IOU</DialogTitle>
          <DialogDescription>
            Record how you paid back {lender?.name || "the lender"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-accent/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Amount to Settle</p>
            <p className="text-2xl font-semibold">{formatCurrency(debt.amount, debt.currency)}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="settlementMethod">How did you pay?</Label>
            <Select value={settlementMethod} onValueChange={(v) => setSettlementMethod(v as PaymentMethod)}>
              <SelectTrigger id="settlementMethod">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">💵 Cash</SelectItem>
                <SelectItem value="upi">📱 UPI</SelectItem>
                <SelectItem value="card">💳 Card</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <p className="text-sm">
              ✓ This will mark the IOU as settled and remove it from your active debts.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSettle} disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Settling..." : "Mark as Settled"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
