import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { TrendingUp, TrendingDown, CalendarIcon, X } from "lucide-react";
import { useApp } from "../../lib/store";
import { DebtRecord } from "../../types";
import { generateId, formatDate } from "../../lib/utils";
import { toast } from "sonner@2.0.3";

interface AddDebtDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AddDebtDialog({ open, onClose }: AddDebtDialogProps) {
  const { currentUser, currentFamily, addDebt } = useApp();
  const [debtType, setDebtType] = useState<"gave" | "took">("gave");
  const [personName, setPersonName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!currentUser || !currentFamily) return;

    const debtAmount = parseFloat(amount);
    if (isNaN(debtAmount) || debtAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!personName.trim()) {
      toast.error("Please enter the person's name");
      return;
    }

    setIsSubmitting(true);
    try {
      const debt: DebtRecord = {
        id: generateId(),
        family_id: currentFamily.id,
        lender_user_id: debtType === "gave" ? currentUser.id : personName,
        borrower_user_id: debtType === "gave" ? personName : currentUser.id,
        amount: debtAmount,
        currency: currentFamily.currency,
        status: "open",
        created_at: date.toISOString(),
      };

      await addDebt(debt);
      toast.success(
        debtType === "gave"
          ? `Recorded: You lent ₹${debtAmount} to ${personName}`
          : `Recorded: You borrowed ₹${debtAmount} from ${personName}`
      );
      handleClose();
    } catch (error) {
      console.error("Failed to add debt:", error);
      toast.error("Failed to record debt");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setPersonName("");
    setAmount("");
    setDate(new Date());
    setDueDate(undefined);
    setNotes("");
    setDebtType("gave");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Add Debt Record</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-6 w-6 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-5">
          {/* Debt Type Toggle */}
          <Tabs
            value={debtType}
            onValueChange={(v) => setDebtType(v as "gave" | "took")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 h-auto p-1 bg-muted">
              <TabsTrigger
                value="gave"
                className="h-12 data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
              >
                <TrendingUp className="mr-2 h-5 w-5" />
                I Gave
              </TabsTrigger>
              <TabsTrigger
                value="took"
                className="h-12 data-[state=active]:bg-background data-[state=active]:text-foreground"
              >
                <TrendingDown className="mr-2 h-5 w-5" />
                I Took
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Person Name */}
          <div className="space-y-2">
            <Label htmlFor="personName">
              {debtType === "gave" ? "Lent To" : "Borrowed From"}
            </Label>
            <Input
              id="personName"
              placeholder="Person's name"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              className="h-12"
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="10"
              className="h-14 text-xl"
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start h-12">
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

          {/* Due Date */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Due Date (Optional)
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start h-12">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? formatDate(dueDate) : "dd-mm-yyyy"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 h-12"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex-1 h-12 ${
                debtType === "gave"
                  ? "bg-emerald-500 hover:bg-emerald-600"
                  : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              {isSubmitting ? "Saving..." : "Save Record"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
