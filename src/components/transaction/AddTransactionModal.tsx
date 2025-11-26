import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "../ui/sheet";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { CalendarIcon, Upload, X, Plus, ArrowLeft, HandCoins, TrendingDown, TrendingUp, Camera } from "lucide-react";
import { useApp } from "../../lib/store";
import { Expense, Income, PaymentLine, DebtRecord, TransactionType } from "../../types";
import { generateId, formatDate, validatePaymentLines, formatCurrency, cn } from "../../lib/utils";
import { toast } from "sonner";
import { PaymentLineRow } from "./PaymentLineRow";
import { VisualCategorySelect } from "./VisualCategorySelect";
import { ReceiptUploader } from "./ReceiptUploader";

interface AddTransactionModalProps {
  open: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
}

export function AddTransactionModal({ open, onClose, defaultType = "expense" }: AddTransactionModalProps) {
  const { currentUser, currentFamily, users, addExpense, addIncome, addDebt, budgets, expenses } = useApp();
  const [transactionType, setTransactionType] = useState<TransactionType>(defaultType);
  const [totalAmount, setTotalAmount] = useState("");
  const [category, setCategory] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState("");
  const [isShared, setIsShared] = useState(true);
  const [useSplitPayment, setUseSplitPayment] = useState(false);
  const [paidBy, setPaidBy] = useState<string>(currentUser?.id || "");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [borrowedFrom, setBorrowedFrom] = useState<string>("");
  const [paymentLines, setPaymentLines] = useState<Partial<PaymentLine>[]>([
    {
      id: generateId(),
      method: "cash",
      amount: 0,
      payer_user_id: currentUser?.id,
    },
  ]);
  const [receipts, setReceipts] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isExpense = transactionType === "expense";

  // Update paidBy when currentUser changes
  useEffect(() => {
    if (currentUser?.id && !paidBy) {
      setPaidBy(currentUser.id);
    }
  }, [currentUser, paidBy]);

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

  const handlePaymentLineChange = (index: number, field: keyof PaymentLine, value: any) => {
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
    if (!currentUser || !currentFamily) return;

    const amount = parseFloat(totalAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!category) {
      toast.error(`Please select a ${isExpense ? "category" : "source"}`);
      return;
    }

    setIsSubmitting(true);
    try {
      if (isExpense) {
        // Build final payment lines for expense
        const finalPaymentLines: PaymentLine[] = useSplitPayment
          ? (paymentLines as PaymentLine[])
          : [
            {
              id: generateId(),
              method: paymentMethod as any,
              amount: amount,
              payer_user_id: paidBy,
              meta: borrowedFrom ? { borrowed_from: borrowedFrom } : undefined,
            },
          ];

        // Validate payment lines
        const validation = validatePaymentLines(amount, finalPaymentLines);
        if (!validation.valid) {
          toast.error(validation.error);
          return;
        }

        // Check Budget
        if (isExpense && category) {
          const budget = budgets.find(b => b.category === category && b.period === "monthly"); // Assuming monthly for now
          if (budget) {
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();

            const categoryExpenses = expenses.filter(e =>
              e.category === category &&
              new Date(e.date).getMonth() === currentMonth &&
              new Date(e.date).getFullYear() === currentYear
            );

            const totalSpent = categoryExpenses.reduce((sum, e) => sum + e.total_amount, 0);
            const newTotal = totalSpent + amount;
            const percentage = (newTotal / budget.amount) * 100;

            if (percentage > 100) {
              toast.error(`Budget Exceeded! You've spent ${percentage.toFixed(0)}% of your ${category} budget.`);
            } else if (percentage >= 80) {
              toast.warning(`Warning: You've used ${percentage.toFixed(0)}% of your ${category} budget.`);
            }
          }
        }

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
          attachments: receipts,
          receipt_urls: receipts,
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

        toast.success(`Expense of ${formatCurrency(amount)} added ✓`);
      } else {
        // Add income
        const income: Income = {
          id: generateId(),
          family_id: currentFamily.id,
          created_by: currentUser.id,
          amount: amount,
          currency: currentFamily.currency,
          source: category,
          date: date.toISOString(),
          notes: notes.trim() || undefined,
          is_shared: isShared,
          sync_status: "pending",
          created_at: new Date().toISOString(),
        };

        await addIncome(income);
        toast.success(`Income of ${formatCurrency(amount)} added ✓`);
      }

      handleClose();
    } catch (error) {
      console.error("Failed to add transaction:", error);
      toast.error(`Failed to add ${isExpense ? "expense" : "income"}`);
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
    setPaidBy(currentUser?.id || "");
    setPaymentMethod("cash");
    setBorrowedFrom("");
    setPaymentLines([
      {
        id: generateId(),
        method: "cash",
        amount: 0,
        payer_user_id: currentUser?.id,
      },
    ]);
    setReceipts([]);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 overflow-y-auto">
        {/* Header with Back Button - Color coded */}
        <div className={`sticky top-0 z-10 border-b px-4 py-3 transition-colors ${isExpense
          ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900"
          : "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900"
          }`}>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-10 w-10 rounded-full shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h2 className="font-semibold flex items-center gap-2 flex-1">
                {isExpense ? (
                  <>
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    <span>Add Expense</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span>Add Income</span>
                  </>
                )}
              </h2>
            </div>
            <Tabs value={transactionType} onValueChange={(v) => setTransactionType(v as TransactionType)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-10 p-1">
                <TabsTrigger
                  value="expense"
                  className="text-xs data-[state=active]:bg-red-500 data-[state=active]:text-white"
                >
                  <TrendingDown className="h-3 w-3 mr-1" />
                  Expense
                </TabsTrigger>
                <TabsTrigger
                  value="income"
                  className="text-xs data-[state=active]:bg-green-500 data-[state=active]:text-white"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Income
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 space-y-4">
          {/* Total Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-base">
              Amount *
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                ₹
              </span>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                step="0.01"
                className="pl-8 h-14 text-2xl"
              />
            </div>
          </div>

          {/* Category / Source - Visual Grid */}
          <VisualCategorySelect
            type={transactionType}
            value={category}
            onChange={setCategory}
          />

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
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Simple Payment - Only for Expenses when Split is OFF */}
          {isExpense && !useSplitPayment && (
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
              {/* Paid By */}
              <div className="space-y-2">
                <Label htmlFor="paidBy">Paid By *</Label>
                <Select value={paidBy} onValueChange={setPaidBy}>
                  <SelectTrigger id="paidBy">
                    <SelectValue placeholder="Who paid?" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} {user.id === currentUser?.id && "(You)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger id="paymentMethod">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">💵 Cash</SelectItem>
                    <SelectItem value="upi">📱 UPI</SelectItem>
                    <SelectItem value="card">💳 Card</SelectItem>
                    <SelectItem value="bank">🏦 Bank Transfer</SelectItem>
                    <SelectItem value="wallet">👛 Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Borrowed From */}
              <div className="space-y-3 pt-3 border-t">
                <div className="flex items-center justify-between">
                  <Label htmlFor="borrowedToggle" className="flex items-center gap-2 cursor-pointer">
                    <HandCoins className="h-4 w-4 text-orange-600" />
                    <span className="text-sm">Borrowed from someone?</span>
                  </Label>
                  <Switch
                    id="borrowedToggle"
                    checked={!!borrowedFrom}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        const firstOtherUser = users.find((u) => u.id !== currentUser?.id);
                        setBorrowedFrom(firstOtherUser?.id || "");
                      } else {
                        setBorrowedFrom("");
                      }
                    }}
                  />
                </div>

                {borrowedFrom && (
                  <div className="bg-orange-50 dark:bg-orange-950/20 border-2 border-orange-200 dark:border-orange-900/50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-orange-800 dark:text-orange-300">
                      <HandCoins className="h-4 w-4" />
                      <span className="font-medium">This money was borrowed</span>
                    </div>
                    <Select value={borrowedFrom} onValueChange={setBorrowedFrom}>
                      <SelectTrigger className="bg-background border-orange-300 dark:border-orange-800">
                        <SelectValue>
                          <span className="flex items-center gap-2">
                            <span className="text-muted-foreground">from</span>
                            <span className="font-medium text-orange-600 dark:text-orange-400">
                              {users.find((u) => u.id === borrowedFrom)?.name || "someone"}
                            </span>
                          </span>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {users
                          .filter((u) => u.id !== currentUser?.id)
                          .map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              <span className="flex items-center gap-2">
                                <span className="text-muted-foreground">from</span>
                                <span className="font-medium">{user.name}</span>
                              </span>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-orange-700 dark:text-orange-400">
                      An IOU will be created for ₹{totalAmount || "0.00"} when you save this transaction
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Split Payment Toggle - Only for Expenses */}
          {isExpense && (
            <>
              <div className="flex items-center justify-between py-3 px-4 bg-muted/30 rounded-lg">
                <div className="flex-1">
                  <Label htmlFor="splitPayment" className="cursor-pointer">
                    Split Payment
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Multiple payment methods (UPI + Cash, etc.)
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
                    <PaymentLineRow
                      key={line.id}
                      line={line}
                      index={index}
                      users={users}
                      currentUser={currentUser}
                      canRemove={paymentLines.length > 1}
                      onUpdate={(field, value) => handlePaymentLineChange(index, field, value)}
                      onRemove={() => handleRemovePaymentLine(index)}
                      onBorrowedToggle={(userId) => handleBorrowedToggle(index, userId)}
                    />
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
                    <div className="text-sm bg-muted/30 p-3 rounded-lg">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total:</span>
                        <span className="font-medium">
                          {formatCurrency(parseFloat(totalAmount) || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-muted-foreground">Allocated:</span>
                        <span className={cn(
                          "font-medium",
                          Math.abs(parseFloat(totalAmount) - paymentLines.reduce((sum, line) => sum + (line.amount || 0), 0)) < 0.01
                            ? "text-green-600"
                            : "text-destructive"
                        )}>
                          {formatCurrency(paymentLines.reduce((sum, line) => sum + (line.amount || 0), 0))}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Receipt Upload */}
          <div className="space-y-3">
            <Label>Receipts</Label>
            <div className="flex flex-wrap gap-3">
              {receipts.map((receipt, index) => (
                <div key={index} className="relative h-20 w-20 rounded-lg overflow-hidden border border-outline">
                  <img src={receipt} alt="Receipt" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setReceipts(receipts.filter((_, i) => i !== index))}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-black/70"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="h-20 w-20 border-dashed border-2 flex flex-col gap-1 items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50"
                onClick={() => document.getElementById('receipt-upload')?.click()}
              >
                <Camera className="h-6 w-6" />
                <span className="text-xs">Add</span>
              </Button>
              <input
                id="receipt-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setReceipts([...receipts, reader.result as string]);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>
          </div>

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
          <div className="flex items-center justify-between py-3 px-4 bg-muted/30 rounded-lg">
            <div className="flex-1">
              <Label htmlFor="isShared" className="cursor-pointer">
                Shared {isExpense ? "Expense" : "Income"}
              </Label>
              <p className="text-xs text-muted-foreground">
                Visible to all family members
              </p>
            </div>
            <Switch id="isShared" checked={isShared} onCheckedChange={setIsShared} />
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 bg-background border-t p-4 -mx-4 -mb-4">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} className="flex-1" size="lg">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`flex-1 ${isExpense
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
                  } text-white`}
                size="lg"
              >
                {isSubmitting ? "Saving..." : `Save ${isExpense ? "Expense" : "Income"}`}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
