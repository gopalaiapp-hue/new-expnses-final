import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Wallet, Building2, CreditCard, Banknote, MoreVertical, Plus } from "lucide-react";
import { Account, AccountType } from "../../types";
import { formatCurrency } from "../../lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface AccountCardProps {
  account: Account;
  compact?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onQuickAdd?: () => void;
}

const ACCOUNT_ICONS: Record<AccountType, any> = {
  cash: Banknote,
  bank: Building2,
  card: CreditCard,
  wallet: Wallet,
};

const ACCOUNT_COLORS: Record<AccountType, string> = {
  cash: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  bank: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  card: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
  wallet: "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
};

export function AccountCard({ account, compact = false, onEdit, onDelete, onQuickAdd }: AccountCardProps) {
  const Icon = ACCOUNT_ICONS[account.type];
  const colorClass = ACCOUNT_COLORS[account.type];
  const balanceChange = account.current_balance > account.opening_balance ? "positive" : 
                       account.current_balance < account.opening_balance ? "negative" : "zero";

  if (compact) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${colorClass}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">{account.name}</h3>
                <p className="text-xs text-muted-foreground capitalize">{account.type}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold">
                {formatCurrency(account.current_balance)}
              </p>
              {balanceChange !== "zero" && (
                <p className={`text-xs ${
                  balanceChange === "positive" ? "text-green-600" : "text-red-600"
                }`}>
                  {balanceChange === "positive" ? "+" : ""}
                  {formatCurrency(account.current_balance - account.opening_balance)}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${colorClass}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{account.name}</h3>
              <Badge variant="secondary" className="text-xs capitalize mt-1">
                {account.type}
              </Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onQuickAdd && (
                <DropdownMenuItem onClick={onQuickAdd}>
                  <Plus className="h-4 w-4 mr-2" />
                  Quick Add
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  Edit Account
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  Delete Account
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-muted-foreground">Current Balance</span>
            <span className="text-2xl font-bold">
              {formatCurrency(account.current_balance)}
            </span>
          </div>
          <div className="flex justify-between items-baseline text-sm">
            <span className="text-muted-foreground">Opening Balance</span>
            <span>{formatCurrency(account.opening_balance)}</span>
          </div>
          {balanceChange !== "zero" && (
            <div className="pt-2 border-t">
              <div className="flex justify-between items-baseline text-sm">
                <span className="text-muted-foreground">Change</span>
                <span className={
                  balanceChange === "positive" ? "text-green-600 font-medium" : "text-red-600 font-medium"
                }>
                  {balanceChange === "positive" ? "+" : ""}
                  {formatCurrency(account.current_balance - account.opening_balance)}
                </span>
              </div>
            </div>
          )}
        </div>

        {account.notes && (
          <p className="text-sm text-muted-foreground mt-4 pt-4 border-t">
            {account.notes}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
