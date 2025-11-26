import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ArrowUpCircle, Info } from "lucide-react";
import { Card } from "../ui/card";
import { useApp } from "../../lib/store";
import { Goal, GoalTransfer, PaymentMethod, Expense, PaymentLine } from "../../types";
import { generateId, formatCurrency, formatDate } from "../../lib/utils";
import { toast } from "sonner";

interface AddGoalTransferDialogProps {
  goal: Goal;
  open: boolean;
  onClose: () => void;
}

export function AddGoalTransferDialog({ goal, open, onClose }: AddGoalTransferDialogProps) {
  const { currentUser, currentFamily, accounts, addGoalTransfer, updateGoal, addExpense } = useApp();
  const [amount, setAmount] = useState("");
  const [fromAccountId, setFromAccountId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setAmount("");
    setFromAccountId("");
    setPaymentMethod("cash");
    setNotes("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!currentUser || !currentFamily) return;

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const remaining = goal.target_amount - goal.current_amount;
    if (transferAmount > remaining) {
      toast.error(`Amount exceeds remaining target (₹${remaining.toFixed(2)})`);
      return;
    }

    if (paymentMethod !== "cash" && !fromAccountId) {
      toast.error("Please select a source account");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create the transfer record
      const transfer: GoalTransfer = {
        id: generateId(),
        goal_id: goal.id,
        from_account_id: paymentMethod === "cash" ? undefined : fromAccountId,
        amount: transferAmount,
        transfer_type: "manual",
        transfer_method: paymentMethod,
        contributed_by: currentUser.id,
        notes: notes.trim() || undefined,
        transfer_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        sync_status: "pending",
      };

      await addGoalTransfer(transfer);

      // Create a corresponding expense record
      const paymentLine: PaymentLine = {
        id: generateId(),
        method: paymentMethod,
        amount: transferAmount,
        payer_user_id: currentUser.id,
        account_id: paymentMethod === "cash" ? undefined : fromAccountId,
      };

      const newExpense: Expense = {
        id: generateId(),
        family_id: currentUser.family_id,
        created_by: currentUser.id,
        total_amount: transferAmount,
        currency: "INR",
        category: "savings",
        date: formatDate(new Date()),
        notes: `Contribution to goal: ${goal.goal_name}`,
        payment_lines: [paymentLine],
        attachments: [],
        is_shared: true,
        sync_status: "synced",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await addExpense(newExpense);

      // Update goal current amount
      const updatedGoal: Goal = {
        ...goal,
        current_amount: goal.current_amount + transferAmount,
        updated_at: new Date().toISOString(),
      };

      // Check if goal is completed
      if (updatedGoal.current_amount >= updatedGoal.target_amount) {
        updatedGoal.is_active = false;
        updatedGoal.completed_at = new Date().toISOString();
        toast.success("Goal reached! 🎉");
      }

      await updateGoal(updatedGoal);

      toast.success(`Added ₹${transferAmount} to "${goal.goal_name}"!`);
      handleClose();
    } catch (error) {
      console.error("Failed to add transfer:", error);
      toast.error("Failed to add money to goal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const remaining = goal.target_amount - goal.current_amount;

  // Payment method descriptions
  const paymentMethodInfo = {
    cash: {
      icon: "💵",
      label: "Cash",
      description: "Save cash physically or deposit later",
      color: "from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20",
      borderColor: "border-green-200 dark:border-green-800"
    },
    upi: {
      icon: "📱",
      label: "UPI",
      description: "Quick digital transfer via UPI apps",
      color: "from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20",
      borderColor: "border-blue-200 dark:border-blue-800"
    },
    card: {
      icon: "💳",
      label: "Debit/Credit Card",
      description: "Using your card payments or rewards",
      color: "from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20",
      borderColor: "border-purple-200 dark:border-purple-800"
    },
    bank: {
      icon: "🏦",
      label: "Bank Transfer",
      description: "Direct bank account transfer",
      color: "from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20",
      borderColor: "border-orange-200 dark:border-orange-800"
    },
    wallet: {
      icon: "👛",
      label: "Wallet",
      description: "Digital wallet or e-payment",
      color: "from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20",
      borderColor: "border-amber-200 dark:border-amber-800"
    },
    borrowed: {
      icon: "🤝",
      label: "Borrowed",
      description: "Borrowed from someone",
      color: "from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20",
      borderColor: "border-indigo-200 dark:border-indigo-800"
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen: boolean) => !isOpen && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <ArrowUpCircle className="h-6 w-6 text-primary" />
            Add Money to Goal
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            <div className="space-y-1">
              <p className="font-medium">{goal.goal_name}</p>
              <p className="text-muted-foreground">Remaining: {formatCurrency(remaining)}</p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Goal Progress Card */}
          <Card className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                <p className="font-medium">How Much Can You Save?</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Remaining to reach goal:</span>
                <span className="text-2xl font-bold text-primary">{formatCurrency(remaining)}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                If you save ₹{formatCurrency(Math.round(remaining / 12))} per month, you can reach your goal in ~1 year
              </p>
            </div>
          </Card>

          {/* Amount Input */}
          <div className="space-y-3">
            <Label htmlFor="amount" className="text-base font-semibold">
              How Much Do You Want to Save? *
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-muted-foreground">
                ₹
              </span>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="100"
                className="pl-10 h-14 text-2xl font-semibold"
              />
            </div>
            {amount && parseFloat(amount) > 0 && (
              <div className="p-3 rounded-lg bg-success/10 border border-success/30">
                <p className="text-sm">
                  After this: <span className="font-semibold">{formatCurrency(goal.current_amount + parseFloat(amount))}</span> / {formatCurrency(goal.target_amount)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Progress: <span className="font-semibold">
                    {((goal.current_amount + parseFloat(amount)) / goal.target_amount * 100).toFixed(1)}%
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Payment Methods - Visual Cards */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">How Do You Want to Save? *</Label>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {(Object.entries(paymentMethodInfo) as Array<[PaymentMethod, any]>).map(([method, info]) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`p-3 rounded-xl border-2 transition-all ${paymentMethod === method
                    ? `bg-gradient-to-br ${info.color} border-primary shadow-md scale-105`
                    : `bg-white dark:bg-slate-950 border-border hover:border-primary/50`
                    }`}
                >
                  <div className="text-3xl mb-2">{info.icon}</div>
                  <div className="text-xs font-medium text-center leading-tight">
                    {info.label}
                  </div>
                </button>
              ))}
            </div>
            {paymentMethodInfo[paymentMethod as PaymentMethod] && (
              <div className="p-3 rounded-lg bg-muted/50 border border-muted">
                <p className="text-sm text-muted-foreground">
                  {paymentMethodInfo[paymentMethod as PaymentMethod].description}
                </p>
              </div>
            )}
          </div>

          {/* From Account / Source */}
          <div className="space-y-2">
            <Label htmlFor="fromAccount">Source</Label>
            {paymentMethod === "cash" ? (
              <div className="p-3 bg-muted/50 rounded-lg border border-muted flex items-center gap-2">
                <span className="text-xl">💵</span>
                <div>
                  <p className="font-medium">Cash Payment</p>
                  <p className="text-xs text-muted-foreground">Amount will be added to goal directly</p>
                </div>
              </div>
            ) : (
              <Select value={fromAccountId} onValueChange={setFromAccountId}>
                <SelectTrigger id="fromAccount" className="h-11">
                  <SelectValue placeholder="Select Bank Account..." />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} - {formatCurrency(account.current_balance)}
                    </SelectItem>
                  ))}
                  {accounts.length === 0 && (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No bank accounts found. Please add one in Settings.
                    </div>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Add Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="e.g., Monthly contribution, Birthday savings, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose} className="flex-1 h-12">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
              className="flex-1 h-12"
            >
              {isSubmitting ? "Saving..." : `Save ${amount ? formatCurrency(parseFloat(amount)) : "Money"}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
