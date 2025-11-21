import { useState } from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Search, X } from "lucide-react";

interface TransactionFilterDialogProps {
  open: boolean;
  onClose: () => void;
  onApplyFilters?: (filters: FilterState) => void;
}

export interface FilterState {
  searchQuery: string;
  timeRange: "all" | "today" | "week" | "month";
  category: string;
  mode: string;
}

const TIME_RANGES = [
  { value: "all", label: "All" },
  { value: "today", label: "Today" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

const EXPENSE_CATEGORIES = [
  "All Categories",
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Bills & Utilities",
  "Entertainment",
  "Healthcare",
  "Education",
  "Personal Care",
  "Home & Garden",
  "Gifts & Donations",
  "Travel",
  "Other",
];

const PAYMENT_MODES = [
  "All Modes",
  "Cash",
  "UPI",
  "Card",
  "Net Banking",
  "Other",
];

export function TransactionFilterDialog({ open, onClose, onApplyFilters }: TransactionFilterDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [timeRange, setTimeRange] = useState<FilterState["timeRange"]>("all");
  const [category, setCategory] = useState("All Categories");
  const [mode, setMode] = useState("All Modes");

  const handleApply = () => {
    onApplyFilters?.({
      searchQuery,
      timeRange,
      category,
      mode,
    });
    onClose();
  };

  const handleReset = () => {
    setSearchQuery("");
    setTimeRange("all");
    setCategory("All Categories");
    setMode("All Modes");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 gap-0 bg-background">
        {/* Search Bar */}
        <div className="p-4 pb-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-12 h-11 bg-surface-variant/30 border-0"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground hover:bg-surface-variant/50 rounded-sm z-10"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Time Range Filters */}
        <div className="px-4 py-4 border-b">
          <div className="flex gap-2">
            {TIME_RANGES.map((range) => (
              <Button
                key={range.value}
                variant={timeRange === range.value ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range.value as FilterState["timeRange"])}
                className={`flex-1 h-9 ${
                  timeRange === range.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-surface-variant/30 hover:bg-surface-variant/50 border-0"
                }`}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Category & Mode Filters */}
        <div className="p-4 space-y-3">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-11 bg-surface-variant/30 border-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EXPENSE_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={mode} onValueChange={setMode}>
            <SelectTrigger className="h-11 bg-surface-variant/30 border-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_MODES.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="p-4 pt-2 flex gap-3 border-t bg-surface-variant/10">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1 h-11"
          >
            Reset
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 h-11 bg-primary hover:bg-primary/90"
          >
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
