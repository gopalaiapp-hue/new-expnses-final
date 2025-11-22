import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Plus } from "lucide-react";
import { TransactionType, CustomCategory } from "../../types";
import { useApp } from "../../lib/store";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

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
  const { currentFamily, currentUser, customCategories, addCustomCategory } = useApp();
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState("");

  const isExpense = type === "expense";
  const defaultCategories = isExpense ? EXPENSE_CATEGORIES : INCOME_SOURCES;

  // Filter custom categories by type and map to CategoryItem
  const mappedCustomCategories: CategoryItem[] = customCategories
    .filter(c => c.type === type)
    .map(c => ({
      value: c.name,
      label: c.name,
      icon: c.icon || "📌"
    }));

  const allCategories = [...defaultCategories, ...mappedCustomCategories];

  const handleAddCustomCategory = async () => {
    const trimmed = customCategoryName.trim();
    if (!trimmed) {
      toast.error("Please enter a category name");
      return;
    }

    if (allCategories.some(cat => cat.value === trimmed)) {
      toast.error("This category already exists");
      return;
    }

    if (!currentFamily || !currentUser) return;

    const newCategory: CustomCategory = {
      id: uuidv4(),
      family_id: currentFamily.id,
      name: trimmed,
      type: type,
      icon: "📌",
      created_by: currentUser.id,
      created_at: new Date().toISOString(),
    };

    try {
      await addCustomCategory(newCategory);
      onChange(trimmed);
      setCustomCategoryName("");
      setShowAddCustom(false);
      toast.success(`Custom ${isExpense ? "category" : "source"} added`);
    } catch (error) {
      console.error("Failed to add custom category:", error);
      toast.error("Failed to add custom category");
    }
  };

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
              className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-all ${value === cat.value
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
