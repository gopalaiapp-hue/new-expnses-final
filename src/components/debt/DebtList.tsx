import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useApp } from "../../lib/store";
import { formatCurrency, getInitials } from "../../lib/utils";
import { DebtRecord } from "../../types";
import { SettleDebtDialog } from "./SettleDebtDialog";
import { MessageCircle } from "lucide-react";

export function DebtList() {
  const { currentUser, debts, users } = useApp();
  const [selectedDebt, setSelectedDebt] = useState<DebtRecord | null>(null);

  // Separate debts I owe and debts owed to me
  const myDebts = debts.filter(
    (d) => d.status === "open" && d.borrower_user_id === currentUser?.id
  );
  const owedToMe = debts.filter(
    (d) => d.status === "open" && d.lender_user_id === currentUser?.id
  );

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user?.name || "Unknown";
  };

  const getUser = (userId: string) => {
    return users.find((u) => u.id === userId);
  };

  if (myDebts.length === 0 && owedToMe.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🤝</div>
        <p className="text-muted-foreground">No active IOUs</p>
        <p className="text-sm text-muted-foreground mt-1">
          Borrowed payments will appear here
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Debts I Owe */}
        {myDebts.length > 0 && (
          <div>
            <h3 className="text-sm text-muted-foreground mb-3">You Owe</h3>
            <div className="space-y-2">
              {myDebts.map((debt) => {
                const lender = getUser(debt.lender_user_id);
                return (
                  <Card key={debt.id} className="p-4 bg-error-container/20 border-destructive/20 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <Avatar>
                          <AvatarFallback>
                            {lender ? getInitials(lender.name) : "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">To {getUserName(debt.lender_user_id)}</p>
                          <p className="text-sm text-muted-foreground">
                            Borrowed on {new Date(debt.created_at).toLocaleDateString("en-IN")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <p className="font-semibold text-red-600">
                          {formatCurrency(debt.amount, debt.currency)}
                        </p>
                        <Button
                          size="sm"
                          onClick={() => setSelectedDebt(debt)}
                        >
                          Settle
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Debts Owed to Me */}
        {owedToMe.length > 0 && (
          <div>
            <h3 className="text-sm text-muted-foreground mb-3">Owed to You</h3>
            <div className="space-y-2">
              {owedToMe.map((debt) => {
                const borrower = getUser(debt.borrower_user_id);
                return (
                  <Card key={debt.id} className="p-4 bg-tertiary-container/20 border-tertiary/20 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <Avatar>
                          <AvatarFallback>
                            {borrower ? getInitials(borrower.name) : "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">From {getUserName(debt.borrower_user_id)}</p>
                          <p className="text-sm text-muted-foreground">
                            Borrowed on {new Date(debt.created_at).toLocaleDateString("en-IN")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          {formatCurrency(debt.amount, debt.currency)}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs gap-1 text-green-700 border-green-200 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950/30"
                            onClick={() => {
                              const message = `Hi ${borrower?.name || "there"}, just a gentle reminder about the ${formatCurrency(debt.amount, debt.currency)} I lent you${debt.linked_expense_id ? "" : ""}.`;
                              const url = borrower?.phone
                                ? `https://wa.me/${borrower.phone}?text=${encodeURIComponent(message)}`
                                : `https://wa.me/?text=${encodeURIComponent(message)}`;
                              window.open(url, "_blank");
                            }}
                          >
                            <MessageCircle className="h-3 w-3" />
                            Nudge
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {selectedDebt && (
        <SettleDebtDialog
          debt={selectedDebt}
          open={!!selectedDebt}
          onClose={() => setSelectedDebt(null)}
        />
      )}
    </>
  );
}
