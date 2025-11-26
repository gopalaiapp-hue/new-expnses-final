import { useState } from "react";
import { Button } from "../ui/button";
import { Plus, Wallet } from "lucide-react";
import { AccountCard } from "./AccountCard";
import { AddAccountDialog } from "./AddAccountDialog";
import { useApp } from "../../lib/store";
import { Alert, AlertDescription } from "../ui/alert";

export function AccountsList() {
  const { accounts = [] } = useApp();
  const [showAddAccount, setShowAddAccount] = useState(false);

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.current_balance, 0);

  if (accounts.length === 0) {
    return (
      <div className="space-y-4">
        <Alert>
          <Wallet className="h-4 w-4" />
          <AlertDescription>
            No accounts found. Add your first account to track cash, bank balance, cards, and wallets.
          </AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button onClick={() => setShowAddAccount(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Account
          </Button>
        </div>
        <AddAccountDialog open={showAddAccount} onClose={() => setShowAddAccount(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Total */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Accounts</h2>
          <p className="text-sm text-muted-foreground">
            Total Balance: <span className="font-medium text-foreground">₹{totalBalance.toFixed(2)}</span>
          </p>
        </div>
        <Button onClick={() => setShowAddAccount(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Account
        </Button>
      </div>

      {/* Account Cards Grouped by Type */}
      <div className="space-y-6">
        {["cash", "bank", "card", "wallet"].map((type) => {
          const typeAccounts = accounts.filter(a => a.type === type);
          if (typeAccounts.length === 0) return null;

          const typeLabel = {
            cash: "Cash",
            bank: "Bank Accounts",
            card: "Cards",
            wallet: "Wallets & UPI"
          }[type as string];

          return (
            <div key={type} className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {typeLabel}
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {typeAccounts.map((account) => (
                  <AccountCard
                    key={account.id}
                    account={account}
                    compact
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <AddAccountDialog open={showAddAccount} onClose={() => setShowAddAccount(false)} />
    </div>
  );
}
