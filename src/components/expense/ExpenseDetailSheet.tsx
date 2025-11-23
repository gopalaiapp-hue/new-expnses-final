import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "../ui/sheet";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Edit2, ArrowLeft, ArrowRight, AlertCircle, TrendingDown, Calendar, Tag, Receipt, RefreshCw } from "lucide-react";
import { useApp } from "../../lib/store";
import { Expense } from "../../types";
import { formatCurrency, formatDateTime, getCategoryIcon, getPaymentMethodIcon, getPaymentMethodLabel, getInitials } from "../../lib/utils";
import { toast } from "sonner";
import { useEffect } from "react";

interface ExpenseDetailSheetProps {
  expenseId: string;
  open: boolean;
  onClose: () => void;
}

export function ExpenseDetailSheet({ expenseId, open, onClose }: ExpenseDetailSheetProps) {
  const { users, debts, currentUser, updateExpense, expenses } = useApp();
  const expense = expenses.find(e => e.id === expenseId);

  const [isEditing, setIsEditing] = useState(false);
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("");

  useEffect(() => {
    if (expense) {
      setEditAmount(expense.total_amount.toString());
      setEditCategory(expense.category);
    }
  }, [expense]);

  if (!expense) return null;

  const creator = users.find((u) => u.id === expense.created_by);
  const canEdit = currentUser?.id === expense.created_by || currentUser?.role === "admin";

  // Find related debts
  const relatedDebts = debts.filter((d) => d.linked_expense_id === expense.id);

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user?.name || "Unknown";
  };

  const handleSaveEdit = async () => {
    if (!expense || !currentUser) return;

    try {
      const newAmount = parseFloat(editAmount);
      if (isNaN(newAmount) || newAmount <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }

      await updateExpense({
        ...expense,
        total_amount: newAmount,
        category: editCategory,
        updated_at: new Date().toISOString(),
      });

      toast.success("Expense updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update expense:", error);
      toast.error("Failed to update expense");
    }
  };

  const handleCancelEdit = () => {
    setEditAmount(expense.total_amount.toString());
    setEditCategory(expense.category);
    setIsEditing(false);
  };

  return (
    <Sheet open={open} onOpenChange={(open) => !open && (isEditing ? handleCancelEdit() : onClose())}>
      <SheetContent side="right" className="ml-auto w-full max-w-lg overflow-y-auto bg-background border-l">
        {/* Header with Back/Close Button */}
        <div className="flex items-center justify-between p-4 pb-3 border-b sticky top-0 bg-background z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={isEditing ? handleCancelEdit : onClose}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex-1 text-center">
            <SheetTitle className="flex items-center justify-center gap-2">
              <span className="text-2xl">{getCategoryIcon(expense.category)}</span>
              {expense.category}
            </SheetTitle>
            <SheetDescription className="flex items-center justify-center gap-1 mt-1">
              <Calendar className="h-3 w-3" />
              {formatDateTime(expense.date)}
            </SheetDescription>
          </div>

          {canEdit && !isEditing && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsEditing(true)}
              className="shrink-0"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Main Content with side margins */}
        <div className="px-6 py-4 space-y-6">

          {/* Amount Section - Editable */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-2xl border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Amount</span>
              {isEditing && (
                <Button
                  onClick={handleSaveEdit}
                  size="sm"
                  className="gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  Save
                </Button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    ₹
                  </span>
                  <Input
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="pl-8 h-12 text-2xl font-bold bg-background border-primary/30"
                    step="0.01"
                  />
                </div>
              </div>
            ) : (
              <div className="text-3xl font-bold text-primary">
                {formatCurrency(expense.total_amount, expense.currency)}
              </div>
            )}
          </div>

          {/* Category Section - Editable */}
          <div className="bg-surface-variant/50 p-4 rounded-xl border">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Category</span>
            </div>

            {isEditing ? (
              <Select value={editCategory} onValueChange={setEditCategory}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Food & Dining">🍽️ Food & Dining</SelectItem>
                  <SelectItem value="Transportation">🚗 Transportation</SelectItem>
                  <SelectItem value="Shopping">🛍️ Shopping</SelectItem>
                  <SelectItem value="Bills & Utilities">💡 Bills & Utilities</SelectItem>
                  <SelectItem value="Entertainment">🎬 Entertainment</SelectItem>
                  <SelectItem value="Healthcare">🏥 Healthcare</SelectItem>
                  <SelectItem value="Education">📚 Education</SelectItem>
                  <SelectItem value="Personal Care">💄 Personal Care</SelectItem>
                  <SelectItem value="Home & Garden">🏠 Home & Garden</SelectItem>
                  <SelectItem value="Gifts & Donations">🎁 Gifts & Donations</SelectItem>
                  <SelectItem value="Travel">✈️ Travel</SelectItem>
                  <SelectItem value="Other">📝 Other</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Badge variant="outline" className="text-sm px-3 py-1">
                {getCategoryIcon(expense.category)} {expense.category}
              </Badge>
            )}
          </div>

          {/* Payment Breakdown */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Receipt className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Payment Details</h3>
            </div>

            <div className="space-y-3">
              {expense.payment_lines.map((line) => {
                const payer = users.find((u) => u.id === line.payer_user_id);
                const isBorrowed = !!line.meta?.borrowed_from;
                const lender = isBorrowed
                  ? users.find((u) => u.id === line.meta?.borrowed_from)
                  : null;

                return (
                  <Card key={line.id} className={`p-4 ${isBorrowed ? "border-orange-200 dark:border-orange-800 bg-orange-50/30 dark:bg-orange-950/10" : ""}`}>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getPaymentMethodIcon(line.method)}</span>
                        <span className="font-medium">{getPaymentMethodLabel(line.method)}</span>
                      </div>
                      <div className="text-lg font-bold">{formatCurrency(line.amount, expense.currency)}</div>
                    </div>

                    {/* Payer */}
                    {payer && (
                      <div className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-xs">{getInitials(payer.name)}</AvatarFallback>
                        </Avatar>
                        <span>Paid by <span className="font-medium text-foreground">{payer.name}</span></span>
                      </div>
                    )}

                    {/* Borrowed */}
                    {isBorrowed && lender && (
                      <div className="mt-3 p-3 bg-orange-50/50 dark:bg-orange-950/20 rounded-lg border border-orange-200/50 dark:border-orange-800/50">
                        <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400 font-medium text-sm mb-1">
                          <AlertCircle className="h-4 w-4" />
                          <span>Borrowed Money</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">{payer?.name}</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">borrowed from</span>
                          <span className="font-medium">{lender.name}</span>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          {expense.notes && (
            <div className="bg-muted/30 p-4 rounded-xl">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                📝 Notes
              </h3>
              <p className="text-sm text-muted-foreground">{expense.notes}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-surface-variant/30 p-4 rounded-xl space-y-3">
            <h3 className="font-semibold text-sm mb-3">Details</h3>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Created by</span>
              <div className="flex items-center gap-2">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-xs">
                    {creator ? getInitials(creator.name) : "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{creator?.name || "Unknown"}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Visibility</span>
              <Badge variant={expense.is_shared ? "default" : "secondary"} className="text-xs">
                {expense.is_shared ? "Shared" : "Private"}
              </Badge>
            </div>

            {relatedDebts.length > 0 && (
              <div>
                <p className="text-muted-foreground text-sm mb-2">Related IOUs</p>
                <div className="space-y-2">
                  {relatedDebts.map((debt) => (
                    <div key={debt.id} className="flex items-center justify-between text-sm p-2 bg-background rounded border">
                      <span>
                        {getUserName(debt.borrower_user_id)} owes{" "}
                        {getUserName(debt.lender_user_id)}
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(debt.amount, debt.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
