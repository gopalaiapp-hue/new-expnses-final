import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { useApp } from "../../lib/store";
import { Expense, PaymentLine, EXPENSE_CATEGORIES, PaymentMethod, DebtRecord } from "../../types";
import { generateId, formatCurrency, validatePaymentLines, formatDate } from "../../lib/utils";
import { toast } from "sonner";

interface AddExpenseModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddExpenseModal({ open, onClose }: AddExpenseModalProps) {
  const { currentUser, currentFamily, users, addExpense, addDebt } = useApp();
  const [totalAmount, setTotalAmount] = useState("");
  const [category, setCategory] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState("");
  const [isShared, setIsShared] = useState(true);
  const [useSplitPayment, setUseSplitPayment] = useState(false);
  const [paymentLines, setPaymentLines] = useState<Partial<PaymentLine>[]>([
    {
      id: generateId(),
      method: "cash",
      amount: 0,
      payer_user_id: currentUser?.id,
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddPaymentLine = () => {
    setPaymentLines([
      ...paymentLines,
      {
        id: generateId(),
        method: "cash",
        amount: 0,
        payer_user_id: currentUser?.id,
      },
    ]);
  };

  const handleRemovePaymentLine = (index: number) => {
    if (paymentLines.length > 1) {
      setPaymentLines(paymentLines.filter((_, i) => i !== index));
    }
  };

  const handlePaymentLineChange = (
    index: number,
    field: keyof PaymentLine,
    value: any
  ) => {
    const updated = [...paymentLines];
    updated[index] = { ...updated[index], [field]: value };
    setPaymentLines(updated);
  };

  const handleBorrowedToggle = (index: number, userId?: string) => {
    const updated = [...paymentLines];
    const currentMeta = updated[index].meta || {};

    if (userId) {
      // Setting borrowed_from
      updated[index] = {
        ...updated[index],
        meta: { ...currentMeta, borrowed_from: userId }
      };
    } else {
      // Removing borrowed_from
      const { borrowed_from, ...restMeta } = currentMeta;
      updated[index] = {
        ...updated[index],
        meta: Object.keys(restMeta).length > 0 ? restMeta : undefined
      };
    }
    setPaymentLines(updated);
  };

  // Helper to toggle borrowed status for the main switch
  const toggleBorrowedStatus = (checked: boolean) => {
    if (checked) {
      // If enabling, default to the first other user if available
      const otherUser = users.find(u => u.id !== currentUser?.id);
      if (otherUser) {
        handleBorrowedToggle(0, otherUser.id);
      } else {
        toast.error("No other family members to borrow from!");
      }
    } else {
      handleBorrowedToggle(0, undefined);
    }
  };

  const handleSubmit = async () => {
    if (!currentUser || !currentFamily) return;

    const amount = parseFloat(totalAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!category) {
      toast.error("Please select a category");
      return;
    }

    // Build final payment lines
    const finalPaymentLines: PaymentLine[] = useSplitPayment
      ? (paymentLines as PaymentLine[])
      : [
        {
          id: generateId(),
          method: paymentLines[0].method as PaymentMethod,
          amount: amount,
          payer_user_id: currentUser.id,
          meta: paymentLines[0].meta,
        },
      ];

    // Validate payment lines
    const validation = validatePaymentLines(amount, finalPaymentLines);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setIsSubmitting(true);
    try {
      const expense: Expense = {
        id: generateId(),
        family_id: currentFamily.id,
        created_by: currentUser.id,
        total_amount: amount,
        currency: currentFamily.currency,
        category,
        date: date.toISOString(),
        notes: notes.trim() || undefined,
        payment_lines: finalPaymentLines,
        attachments: [],
        is_shared: isShared,
        sync_status: "pending",
        created_at: new Date().toISOString(),
      };

      await addExpense(expense);

      // Create debt records for borrowed payments
      for (const line of finalPaymentLines) {
        if (line.meta?.borrowed_from) {
          const debt: DebtRecord = {
            id: generateId(),
            family_id: currentFamily.id,
            lender_user_id: line.meta.borrowed_from,
            borrower_user_id: line.payer_user_id,
            amount: line.amount,
            currency: currentFamily.currency,
            status: "open",
            created_at: new Date().toISOString(),
            linked_expense_id: expense.id,
            reminder_shown: false,
          };
          await addDebt(debt);
        }
      }

      toast.success("Expense added successfully");
      handleClose();
    } catch (error) {
      console.error("Failed to add expense:", error);
      toast.error("Failed to add expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTotalAmount("");
    setCategory("");
    setDate(new Date());
    setNotes("");
    setIsShared(true);
    setUseSplitPayment(false);
    setPaymentLines([
      {
        id: generateId(),
        method: "cash",
        amount: 0,
        payer_user_id: currentUser?.id,
      },
    ]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-950">
        <DialogHeader>
          <DialogTitle className="text-primary">Add Expense</DialogTitle>
          <DialogDescription>Record a new expense for your family</DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-4">
          {/* Total Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Total Amount *</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              step="0.01"
              className="text-lg font-semibold"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category" className="focus:ring-primary focus:border-primary">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start hover:bg-primary/5 hover:border-primary/50">
                  <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                  {formatDate(date)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>


          {/* Split Payment Toggle */}
          <div className="flex items-center justify-between py-2 border-y">
            <div>
              <Label htmlFor="splitPayment">Split Payment</Label>
              <p className="text-sm text-muted-foreground">
                Pay with multiple methods (UPI + Cash, etc.)
              </p>
            </div>
            <Switch
              id="splitPayment"
              checked={useSplitPayment}
              onCheckedChange={setUseSplitPayment}
            />
          </div>

          {/* Borrowed Toggle (only when split payment is disabled) */}
          {!useSplitPayment && (
            <div className="flex items-center justify-between py-3 px-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
              <div>
                <Label htmlFor="isBorrowed" className="text-orange-900 dark:text-orange-100">Borrowed Money</Label>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Mark this expense as borrowed
                </p>
              </div>
              <Switch
                id="isBorrowed"
                checked={!!paymentLines[0].meta?.borrowed_from}
                onCheckedChange={toggleBorrowedStatus}
              />
            </div>
          )}

          {/* Show borrowed from selector when borrowed and split payment disabled */}
          {!useSplitPayment && paymentLines[0].meta?.borrowed_from && (
            <div className="space-y-2 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
              <Label htmlFor="borrowedFrom" className="text-orange-900 dark:text-orange-100">Borrowed from</Label>
              <Select
                value={paymentLines[0].meta.borrowed_from}
                onValueChange={(userId) => handleBorrowedToggle(0, userId)}
              >
                <SelectTrigger id="borrowedFrom" className="bg-white dark:bg-slate-950 border-orange-200 dark:border-orange-800 focus:ring-orange-500 focus:border-orange-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {users
                    .filter((u) => u.id !== currentUser?.id)
                    .map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Payment Lines */}
          {useSplitPayment && (
            <div className="space-y-3 border-t pt-4">
              <Label className="font-semibold">Payment Methods</Label>
              {paymentLines.map((line, index) => (
                <div key={line.id} className="border border-primary/30 rounded-lg p-4 bg-white dark:bg-slate-900 shadow-sm space-y-3">
                  <div className="flex gap-2">
                    <Select
                      value={line.method}
                      onValueChange={(value) =>
                        handlePaymentLineChange(index, "method", value)
                      }
                    >
                      <SelectTrigger className="flex-1 bg-white dark:bg-slate-950 border-primary/20 focus:ring-primary focus:border-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">💵 Cash</SelectItem>
                        <SelectItem value="upi">📱 UPI</SelectItem>
                        <SelectItem value="card">💳 Card</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={line.amount || ""}
                      onChange={(e) =>
                        handlePaymentLineChange(index, "amount", parseFloat(e.target.value))
                      }
                      className="flex-1 bg-white dark:bg-slate-950 border-primary/20 focus:ring-primary focus:border-primary"
                      step="0.01"
                    />
                    {paymentLines.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemovePaymentLine(index)}
                        className="hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Borrowed From */}
                  <div className="space-y-2 border-t pt-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={!!line.meta?.borrowed_from}
                        onCheckedChange={(checked) =>
                          handleBorrowedToggle(
                            index,
                            checked
                              ? users.find((u) => u.id !== currentUser?.id)?.id
                              : undefined
                          )
                        }
                      />
                      <Label className="text-sm font-medium">Borrowed Money</Label>
                    </div>
                    {line.meta?.borrowed_from && (
                      <div className="ml-7">
                        <Label className="text-xs text-muted-foreground">Borrowed from</Label>
                        <Select
                          value={line.meta.borrowed_from}
                          onValueChange={(userId) => handleBorrowedToggle(index, userId)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {users
                              .filter((u) => u.id !== currentUser?.id)
                              .map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                  {user.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={handleAddPaymentLine}
                className="w-full border-primary/50 text-primary hover:bg-primary/5 hover:border-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>

              {/* Validation Display */}
              {totalAmount && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Total: </span>
                  <span>{formatCurrency(parseFloat(totalAmount) || 0)}</span>
                  <span className="mx-2">|</span>
                  <span className="text-muted-foreground">Split: </span>
                  <span>
                    {formatCurrency(
                      paymentLines.reduce((sum, line) => sum + (line.amount || 0), 0)
                    )}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* Shared Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="isShared">Shared Expense</Label>
              <p className="text-sm text-muted-foreground">
                Visible to all family members
              </p>
            </div>
            <Switch id="isShared" checked={isShared} onCheckedChange={setIsShared} />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-primary hover:bg-primary/90 text-white"
            >
              {isSubmitting ? "Saving..." : "Save Expense"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
