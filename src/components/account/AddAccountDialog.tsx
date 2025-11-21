import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Wallet, Building2, CreditCard, Banknote } from "lucide-react";
import { useApp } from "../../lib/store";
import { Account, AccountType } from "../../types";
import { generateId } from "../../lib/utils";
import { toast } from "sonner@2.0.3";

interface AddAccountDialogProps {
  open: boolean;
  onClose: () => void;
}

const ACCOUNT_TYPES: { value: AccountType; label: string; icon: any; description: string }[] = [
  { 
    value: "cash", 
    label: "Cash", 
    icon: Banknote,
    description: "Physical cash at home or wallet"
  },
  { 
    value: "bank", 
    label: "Bank Account", 
    icon: Building2,
    description: "Savings or current account"
  },
  { 
    value: "card", 
    label: "Credit/Debit Card", 
    icon: CreditCard,
    description: "Card balance or limit"
  },
  { 
    value: "wallet", 
    label: "Digital Wallet", 
    icon: Wallet,
    description: "UPI, PayTM, PhonePe, etc."
  },
];

export function AddAccountDialog({ open, onClose }: AddAccountDialogProps) {
  const { currentUser, currentFamily, addAccount } = useApp();
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("cash");
  const [openingBalance, setOpeningBalance] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!currentUser || !currentFamily) return;

    if (!name.trim()) {
      toast.error("Please enter an account name");
      return;
    }

    const balance = parseFloat(openingBalance) || 0;
    if (isNaN(balance)) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);
    try {
      const account: Account = {
        id: generateId(),
        family_id: currentFamily.id,
        name: name.trim(),
        type,
        opening_balance: balance,
        current_balance: balance,
        currency: currentFamily.currency,
        notes: notes.trim() || undefined,
        created_by: currentUser.id,
        created_at: new Date().toISOString(),
      };

      await addAccount(account);
      toast.success(`Account "${name}" added successfully`);
      handleClose();
    } catch (error) {
      console.error("Failed to add account:", error);
      toast.error("Failed to add account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName("");
    setType("cash");
    setOpeningBalance("");
    setNotes("");
    onClose();
  };

  const selectedType = ACCOUNT_TYPES.find((t) => t.value === type) || ACCOUNT_TYPES[0];
  const TypeIcon = selectedType.icon;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Account</DialogTitle>
          <DialogDescription>
            Track your cash, bank accounts, cards, and digital wallets
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Account Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Account Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Home Cash, HDFC Savings, Paytm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          {/* Account Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Account Type *</Label>
            <Select value={type} onValueChange={(v) => setType(v as AccountType)}>
              <SelectTrigger id="type">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <TypeIcon className="h-4 w-4" />
                    <span>{selectedType.label}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPES.map((accountType) => {
                  const Icon = accountType.icon;
                  return (
                    <SelectItem key={accountType.value} value={accountType.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <div>
                          <div>{accountType.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {accountType.description}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Opening Balance */}
          <div className="space-y-2">
            <Label htmlFor="balance">Current Balance *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                ₹
              </span>
              <Input
                id="balance"
                type="number"
                placeholder="0.00"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                className="pl-8"
                step="0.01"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enter the current amount in this account
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="e.g., Last 4 digits: 1234"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Adding..." : "Add Account"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
