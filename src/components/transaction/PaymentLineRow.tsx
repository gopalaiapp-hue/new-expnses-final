import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { Trash2, Wallet, CreditCard, Banknote, Smartphone, Building2, HandCoins } from "lucide-react";
import { PaymentLine, PaymentMethod, User, Account } from "../../types";
import { useApp } from "../../lib/store";

interface PaymentLineRowProps {
  line: Partial<PaymentLine>;
  index: number;
  users: User[];
  currentUser: User | null;
  canRemove: boolean;
  onUpdate: (field: keyof PaymentLine, value: any) => void;
  onRemove: () => void;
  onBorrowedToggle: (userId?: string) => void;
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: any }[] = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "upi", label: "UPI", icon: Smartphone },
  { value: "card", label: "Card", icon: CreditCard },
  { value: "bank", label: "Bank Transfer", icon: Building2 },
  { value: "wallet", label: "Wallet", icon: Wallet },
];

export function PaymentLineRow({
  line,
  index,
  users,
  currentUser,
  canRemove,
  onUpdate,
  onRemove,
  onBorrowedToggle,
}: PaymentLineRowProps) {
  const { accounts } = useApp();
  const selectedMethod = PAYMENT_METHODS.find((m) => m.value === line.method) || PAYMENT_METHODS[0];
  const IconComponent = selectedMethod.icon;

  // Get accounts that match the selected payment method
  const matchingAccounts = accounts.filter((account) => {
    switch (line.method) {
      case "cash":
        return account.type === "cash";
      case "bank":
        return account.type === "bank";
      case "card":
        return account.type === "card";
      case "upi":
        return account.type === "wallet"; // UPI typically uses wallet accounts
      case "wallet":
        return account.type === "wallet";
      default:
        return true;
    }
  });

  return (
    <div className="border-2 border-border rounded-xl p-4 space-y-3 bg-card">
      <div className="flex gap-2">
        {/* Payment Method Select */}
        <Select
          value={line.method}
          onValueChange={(value) => {
            onUpdate("method", value as PaymentMethod);
            // Reset account when method changes
            onUpdate("account_id", undefined);
          }}
        >
          <SelectTrigger className="flex-1">
            <SelectValue>
              <div className="flex items-center gap-2">
                <IconComponent className="h-4 w-4" />
                <span>{selectedMethod.label}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_METHODS.map((method) => {
              const Icon = method.icon;
              return (
                <SelectItem key={method.value} value={method.value}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{method.label}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {/* Amount Input */}
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            ₹
          </span>
          <Input
            type="number"
            placeholder="Amount"
            value={line.amount || ""}
            onChange={(e) => onUpdate("amount", parseFloat(e.target.value) || 0)}
            className="pl-7"
            step="0.01"
          />
        </div>

        {/* Remove Button */}
        {canRemove && (
          <Button variant="ghost" size="icon" onClick={onRemove} className="shrink-0">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        )}
      </div>

      {/* Account Selection - Only show if accounts match payment method */}
      {matchingAccounts.length > 0 && (
        <div className="pt-2">
          <Label htmlFor={`account-${line.id}`} className="text-sm font-medium">
            Choose Account
          </Label>
          <Select
            value={line.account_id || ""}
            onValueChange={(value) => onUpdate("account_id", value)}
          >
            <SelectTrigger id={`account-${line.id}`} className="mt-1">
              <SelectValue placeholder={`Select ${selectedMethod.label.toLowerCase()} account`} />
            </SelectTrigger>
            <SelectContent>
              {matchingAccounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{account.name}</span>
                    <span className="text-sm text-muted-foreground">
                      ₹{account.current_balance.toFixed(2)}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {line.account_id && line.amount && matchingAccounts.find(a => a.id === line.account_id) && (
            <p className="text-xs text-muted-foreground mt-1">
              Balance after: ₹{(matchingAccounts.find(a => a.id === line.account_id)!.current_balance - (line.amount || 0)).toFixed(2)}
            </p>
          )}
        </div>
      )}

      {/* Borrowed From - Improved UX */}
      <div className="pt-3 border-t space-y-3">
        {/* Toggle Row */}
        <div className="flex items-center justify-between">
          <Label htmlFor={`borrowed-${line.id}`} className="flex items-center gap-2 cursor-pointer">
            <HandCoins className="h-4 w-4 text-orange-600" />
            <span className="text-sm">Borrowed from someone?</span>
          </Label>
          <Switch
            id={`borrowed-${line.id}`}
            checked={!!line.meta?.borrowed_from}
            onCheckedChange={(checked) => {
              if (checked) {
                // Find first non-current user, or default to 'custom' if none exist
                const otherUser = users.find((u) => u.id !== currentUser?.id);
                onBorrowedToggle(otherUser?.id || 'custom');
              } else {
                onBorrowedToggle(undefined);
              }
            }}
          />
        </div>

        {/* Lender Selection - Shows when borrowed is enabled */}
        {line.meta?.borrowed_from && (
          <div className="bg-orange-50 dark:bg-orange-950/20 border-2 border-orange-200 dark:border-orange-900/50 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm text-orange-800 dark:text-orange-300">
              <HandCoins className="h-4 w-4" />
              <span className="font-medium">This money was borrowed</span>
            </div>
            <Select
              value={line.meta.borrowed_from}
              onValueChange={(userId) => onBorrowedToggle(userId)}
            >
              <SelectTrigger className="bg-background border-orange-300 dark:border-orange-800">
                <SelectValue>
                  <span className="flex items-center gap-2">
                    <span className="text-muted-foreground">from</span>
                    <span className="font-medium text-orange-600 dark:text-orange-400">
                      {line.meta.borrowed_from === 'custom'
                        ? (line.meta.borrowed_from_name || 'someone else')
                        : (users.find((u) => u.id === line.meta?.borrowed_from)?.name || "someone")}
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
                <SelectItem value="custom">
                  <span className="flex items-center gap-2">
                    <span className="text-muted-foreground">from</span>
                    <span className="font-medium">Someone else (custom name)</span>
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Custom Name Input - Shows when "Someone else" is selected */}
            {line.meta.borrowed_from === 'custom' && (
              <div className="space-y-1">
                <Label htmlFor={`custom-name-${line.id}`} className="text-xs text-orange-700 dark:text-orange-400">
                  Enter person's name
                </Label>
                <Input
                  id={`custom-name-${line.id}`}
                  type="text"
                  placeholder="e.g., John Doe"
                  value={line.meta.borrowed_from_name || ''}
                  onChange={(e) => onUpdate('meta', { ...line.meta, borrowed_from_name: e.target.value })}
                  className="bg-background border-orange-300 dark:border-orange-800"
                />
              </div>
            )}

            <p className="text-xs text-orange-700 dark:text-orange-400">
              An IOU will be created for ₹{line.amount?.toFixed(2) || "0.00"} when you save this transaction
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
