import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Plus } from "lucide-react";
import { TransactionType } from "../../types";
import { useApp } from "../../lib/store";
import { toast } from "sonner@2.0.3";

interface CategoryItem {
  value: string;
  label: string;
  icon: string;
}

const EXPENSE_CATEGORIES: CategoryItem[] = [
  { value: "Groceries", label: "Groceries", icon: "🛒" },
  { value: "Utilities", label: "Utilities", icon: "⚡" },
  { value: "Transportation", label: "Transport", icon: "🚗" },
  { value: "Healthcare", label: "Healthcare", icon: "❤️" },
  { value: "Education", label: "Education", icon: "🎓" },
  { value: "Entertainment", label: "Entertainment", icon: "🎬" },
  { value: "Shopping", label: "Shopping", icon: "🛍️" },
  { value: "Rent", label: "Rent", icon: "🏠" },
  { value: "Food & Dining", label: "Food & Dining", icon: "🍴" },
  { value: "Bills", label: "Bills", icon: "📄" },
  { value: "Fuel", label: "Fuel", icon: "⛽" },
  { value: "Household Items", label: "Maid Salary", icon: "🧹" },
];

const INCOME_SOURCES: CategoryItem[] = [
  { value: "Salary", label: "Salary", icon: "💰" },
  { value: "Business", label: "Business", icon: "💼" },
  { value: "Freelance", label: "Freelance", icon: "💻" },
  { value: "Investment", label: "Investment", icon: "📈" },
  { value: "Gift", label: "Gift", icon: "🎁" },
  { value: "Rental", label: "Rental", icon: "🏘️" },
  { value: "Side Income", label: "Side Income", icon: "🔧" },
  { value: "Other", label: "Other", icon: "➕" },
];

interface VisualCategorySelectProps {
  type: TransactionType;
  value: string;
  onChange: (value: string) => void;
}

export function VisualCategorySelect({ type, value, onChange }: VisualCategorySelectProps) {
  const { currentFamily } = useApp();
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState("");
  const [customCategories, setCustomCategories] = useState<CategoryItem[]>([]);

  const isExpense = type === "expense";
  const defaultCategories = isExpense ? EXPENSE_CATEGORIES : INCOME_SOURCES;
  const allCategories = [...defaultCategories, ...customCategories];

  const handleAddCustomCategory = () => {
    const trimmed = customCategoryName.trim();
    if (!trimmed) {
      toast.error("Please enter a category name");
      return;
    }

    if (allCategories.some(cat => cat.value === trimmed)) {
      toast.error("This category already exists");
      return;
    }

    const newCategory: CategoryItem = {
      value: trimmed,
      label: trimmed,
      icon: "📌"
    };

    // Save to localStorage for persistence
    const storageKey = `customCategories_${currentFamily?.id}_${type}`;
    const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
    const updated = [...existing, newCategory];
    localStorage.setItem(storageKey, JSON.stringify(updated));

    setCustomCategories(updated);
    onChange(trimmed);
    setCustomCategoryName("");
    setShowAddCustom(false);
    toast.success(`Custom ${isExpense ? "category" : "source"} added`);
  };

  // Load custom categories on mount
  useEffect(() => {
    if (currentFamily) {
      const storageKey = `customCategories_${currentFamily.id}_${type}`;
      const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
      setCustomCategories(saved);
    }
  }, [currentFamily, type]);

  return (
    <>
      <div className="space-y-2">
        <Label>Category *</Label>
        <div className="grid grid-cols-4 gap-2">
          {allCategories.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => onChange(cat.value)}
              className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-all ${
                value === cat.value
                  ? "border-primary bg-primary/10"
                  : "border-border bg-background hover:bg-accent"
              }`}
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-xs text-center leading-tight line-clamp-2">
                {cat.label}
              </span>
            </button>
          ))}
          
          {/* Add Custom Button */}
          <button
            type="button"
            onClick={() => setShowAddCustom(true)}
            className="p-3 rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 flex flex-col items-center gap-1 transition-all"
          >
            <Plus className="h-6 w-6 text-muted-foreground" />
            <span className="text-xs text-center text-muted-foreground">
              Custom
            </span>
          </button>
        </div>
      </div>

      {/* Add Custom Category Dialog */}
      <Dialog open={showAddCustom} onOpenChange={setShowAddCustom}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Custom {isExpense ? "Category" : "Source"}</DialogTitle>
            <DialogDescription>
              Create a new {isExpense ? "expense category" : "income source"} for your family
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="custom-category">
                {isExpense ? "Category" : "Source"} Name
              </Label>
              <Input
                id="custom-category"
                placeholder={`e.g., ${isExpense ? "Pet Supplies" : "Side Hustle"}`}
                value={customCategoryName}
                onChange={(e) => setCustomCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddCustomCategory();
                  }
                }}
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowAddCustom(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleAddCustomCategory} className="flex-1">
                Add {isExpense ? "Category" : "Source"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
