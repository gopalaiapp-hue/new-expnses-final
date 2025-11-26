import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "../ui/sheet";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import {
  Calendar,
  User,
  Wallet,
  Receipt,
  HandCoins,
  CheckCircle2,
  Clock,
  Share2,
  Lock
} from "lucide-react";
import { Expense } from "../../types";
import { useApp } from "../../lib/store";
import { formatCurrency, formatDate } from "../../lib/utils";

interface TransactionDetailSheetProps {
  expense: Expense | null;
  open: boolean;
  onClose: () => void;
}

const PAYMENT_METHOD_ICONS: Record<string, string> = {
  cash: "💵",
  upi: "📱",
  card: "💳",
  bank: "🏦",
  wallet: "👛",
};

export function TransactionDetailSheet({ expense, open, onClose }: TransactionDetailSheetProps) {
  const { users, debts } = useApp();

  if (!expense) return null;

  const creator = users.find((u) => u.id === expense.created_by);
  const relatedDebts = debts.filter((d) => d.linked_expense_id === expense.id);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <SheetTitle className="text-3xl">
                {formatCurrency(expense.total_amount)}
              </SheetTitle>
              <SheetDescription className="text-base mt-1">
                {expense.category}
              </SheetDescription>
            </div>
            {expense.is_shared ? (
              <Badge variant="secondary" className="gap-1">
                <Share2 className="h-3 w-3" />
                Shared
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1">
                <Lock className="h-3 w-3" />
                Private
              </Badge>
            )}
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{formatDate(new Date(expense.date))}</span>
            </div>

            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Added by {creator?.name || "Unknown"}</span>
            </div>
          </div>

          <Separator />

          {/* Payment Details */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Payment Details
            </h3>
            <div className="space-y-2">
              {expense.payment_lines.map((line, index) => {
                const payer = users.find((u) => u.id === line.payer_user_id);
                const lender = line.meta?.borrowed_from
                  ? (line.meta.borrowed_from === "custom"
                    ? { id: "custom", name: (line.meta as any).lender_name || "Someone else" }
                    : users.find((u) => u.id === line.meta?.borrowed_from))
                  : null;
                const relatedDebt = relatedDebts.find(
                  (d) => (d.lender_user_id === line.meta?.borrowed_from || (line.meta?.borrowed_from === "custom" && d.lender_user_id === "external")) &&
                    d.borrower_user_id === line.payer_user_id
                );

                return (
                  <div
                    key={line.id}
                    className={`p-3 rounded-lg border ${lender ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/50' : 'bg-muted/30'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{PAYMENT_METHOD_ICONS[line.method] || "💰"}</span>
                        <span className="capitalize">{line.method}</span>
                      </div>
                      <span className="font-medium">
                        {formatCurrency(line.amount)}
                      </span>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      Paid by {payer?.name || "Unknown"}
                    </div>

                    {lender && (
                      <div className="mt-2 pt-2 border-t border-orange-200 dark:border-orange-800">
                        <div className="flex items-center gap-2 text-sm text-orange-700 dark:text-orange-400">
                          <HandCoins className="h-3 w-3" />
                          <span>Borrowed from {lender?.name}</span>
                          {relatedDebt && (
                            <Badge
                              variant={relatedDebt.status === "settled" ? "default" : "secondary"}
                              className="ml-auto"
                            >
                              {relatedDebt.status === "settled" ? (
                                <>
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Settled
                                </>
                              ) : (
                                <>
                                  <Clock className="h-3 w-3 mr-1" />
                                  Pending
                                </>
                              )}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          {expense.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Notes
                </h3>
                <p className="text-sm text-muted-foreground">{expense.notes}</p>
              </div>
            </>
          )}

          {/* Receipts */}
          {expense.receipt_urls && expense.receipt_urls.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Receipts ({expense.receipt_urls.length})
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {expense.receipt_urls.map((url, index) => (
                    <div key={index} className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                      <img src={url} alt={`Receipt ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Related Debts */}
          {relatedDebts.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="flex items-center gap-2">
                  <HandCoins className="h-4 w-4" />
                  Related IOUs
                </h3>
                {relatedDebts.map((debt) => {
                  const lender = users.find((u) => u.id === debt.lender_user_id);
                  const borrower = users.find((u) => u.id === debt.borrower_user_id);
                  return (
                    <div key={debt.id} className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          {borrower?.name} owes {lender?.name}
                        </div>
                        <div className="font-medium">
                          {formatCurrency(debt.amount)}
                        </div>
                      </div>
                      <Badge
                        variant={debt.status === "settled" ? "default" : "secondary"}
                        className="mt-2"
                      >
                        {debt.status === "settled" ? "Settled" : "Pending"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
