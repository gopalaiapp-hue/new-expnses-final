import { useState, useEffect } from "react";
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
import { Expense, PaymentLine, EXPENSE_CATEGORIES, PaymentMethod } from "../../types";
import { generateId, formatCurrency, validatePaymentLines, formatDate } from "../../lib/utils";
import { toast } from "sonner@2.0.3";

interface EditExpenseModalProps {
  open: boolean;
  onClose: () => void;
  expense: Expense | null;
}

export function EditExpenseModal({ open, onClose, expense }: EditExpenseModalProps) {
  const { currentUser, currentFamily, users, updateExpense } = useApp();
  const [totalAmount, setTotalAmount] = useState("");
  const [category, setCategory] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState("");
  const [isShared, setIsShared] = useState(true);
  const [useSplitPayment, setUseSplitPayment] = useState(false);
  const [paymentLines, setPaymentLines] = useState<Partial<PaymentLine>[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with expense data
  useEffect(() => {
    if (expense && open) {
      setTotalAmount(expense.total_amount.toString());
      setCategory(expense.category);
      setDate(new Date(expense.date));
      setNotes(expense.notes || "");
      setIsShared(expense.is_shared);
      setUseSplitPayment(expense.payment_lines.length > 1);
      setPaymentLines(expense.payment_lines);
    }
  }, [expense, open]);

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
    if (userId) {
      updated[index].meta = { ...updated[index].meta, borrowed_from: userId };
    } else {
      const { borrowed_from, ...meta } = updated[index].meta || {};
      updated[index].meta = Object.keys(meta).length > 0 ? meta : undefined;
    }
    setPaymentLines(updated);
  };

  const handleSubmit = async () => {
    if (!currentUser || !currentFamily || !expense) return;

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
            id: paymentLines[0]?.id || generateId(),
            method: (paymentLines[0]?.method || "cash") as PaymentMethod,
            amount: amount,
            payer_user_id: currentUser.id,
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
      const updatedExpense: Expense = {
        ...expense,
        total_amount: amount,
        category,
        date: date.toISOString(),
        notes: notes.trim() || undefined,
        payment_lines: finalPaymentLines,
        is_shared: isShared,
        updated_at: new Date().toISOString(),
      };

      await updateExpense(updatedExpense);
      toast.success("Expense updated successfully");
      handleClose();
    } catch (error) {
      console.error("Failed to update expense:", error);
      toast.error("Failed to update expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!expense) return null;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
          <DialogDescription>Update expense details</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
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
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formatDate(date)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} />
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

          {/* Payment Lines */}
          {useSplitPayment && (
            <div className="space-y-3">
              <Label>Payment Methods</Label>
              {paymentLines.map((line, index) => (
                <div key={line.id} className="border rounded-lg p-3 space-y-3">
                  <div className="flex gap-2">
                    <Select
                      value={line.method}
                      onValueChange={(value) =>
                        handlePaymentLineChange(index, "method", value)
                      }
                    >
                      <SelectTrigger className="flex-1">
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
                      className="flex-1"
                      step="0.01"
                    />
                    {paymentLines.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemovePaymentLine(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Borrowed From */}
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
                    <Label className="text-sm">Borrowed</Label>
                    {line.meta?.borrowed_from && (
                      <Select
                        value={line.meta.borrowed_from}
                        onValueChange={(userId) => handleBorrowedToggle(index, userId)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {users
                            .filter((u) => u.id !== currentUser?.id)
                            .map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                from {user.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={handleAddPaymentLine}
                className="w-full"
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
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Updating..." : "Update Expense"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
