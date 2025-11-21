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
import { CalendarIcon } from "lucide-react";
import { useApp } from "../../lib/store";
import { Income, INCOME_SOURCES } from "../../types";
import { generateId, formatDate } from "../../lib/utils";
import { toast } from "sonner@2.0.3";

interface AddIncomeModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddIncomeModal({ open, onClose }: AddIncomeModalProps) {
  const { currentUser, currentFamily, addIncome } = useApp();
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState("");
  const [isShared, setIsShared] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!currentUser || !currentFamily) return;

    const incomeAmount = parseFloat(amount);
    if (isNaN(incomeAmount) || incomeAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!source) {
      toast.error("Please select a source");
      return;
    }

    setIsSubmitting(true);
    try {
      const income: Income = {
        id: generateId(),
        family_id: currentFamily.id,
        created_by: currentUser.id,
        amount: incomeAmount,
        currency: currentFamily.currency,
        source,
        date: date.toISOString(),
        notes: notes.trim() || undefined,
        is_shared: isShared,
        sync_status: "pending",
        created_at: new Date().toISOString(),
      };

      await addIncome(income);
      toast.success("Income added successfully");
      handleClose();
    } catch (error) {
      console.error("Failed to add income:", error);
      toast.error("Failed to add income");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setAmount("");
    setSource("");
    setDate(new Date());
    setNotes("");
    setIsShared(true);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Income</DialogTitle>
          <DialogDescription>Record new income for your family</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
            />
          </div>

          {/* Source */}
          <div className="space-y-2">
            <Label htmlFor="source">Source *</Label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger id="source">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                {INCOME_SOURCES.map((src) => (
                  <SelectItem key={src} value={src}>
                    {src}
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
              <Label htmlFor="isShared">Shared Income</Label>
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
              {isSubmitting ? "Saving..." : "Save Income"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
