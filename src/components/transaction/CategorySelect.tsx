import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Plus, Tag } from "lucide-react";
import { EXPENSE_CATEGORIES, INCOME_SOURCES, TransactionType, CustomCategory } from "../../types";
import { useApp } from "../../lib/store";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface CategorySelectProps {
  type: TransactionType;
  value: string;
  onChange: (value: string) => void;
}

export function CategorySelect({ type, value, onChange }: CategorySelectProps) {
  const { currentFamily, currentUser, customCategories, addCustomCategory } = useApp();
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState("");

  const isExpense = type === "expense";
  const defaultCategories = isExpense ? EXPENSE_CATEGORIES : INCOME_SOURCES;

  const filteredCustomCategories = customCategories
    .filter(c => c.type === type);

  const allCategories = [...defaultCategories, ...filteredCustomCategories.map(c => c.name)];

  const handleAddCustomCategory = async () => {
    const trimmed = customCategoryName.trim();
    if (!trimmed) {
      toast.error("Please enter a category name");
      return;
    }

    if (allCategories.includes(trimmed)) {
      toast.error("This category already exists");
      return;
    }

    if (!currentFamily || !currentUser) return;

    const newCategory: CustomCategory = {
      id: uuidv4(),
      family_id: currentFamily.id,
      name: trimmed,
      type: type,
      icon: "🏷️", // Default icon for dropdown
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
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="category">
          <SelectValue placeholder={`Select ${isExpense ? "category" : "source"}`} />
        </SelectTrigger>
        <SelectContent>
          {/* Default categories */}
          {defaultCategories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}

          {/* Custom categories */}
          {filteredCustomCategories.length > 0 && (
            <>
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                Custom
              </div>
              {filteredCustomCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{cat.icon || "🏷️"}</span>
                    {cat.name}
                  </div>
                </SelectItem>
              ))}
            </>
          )}

          {/* Add custom button */}
          <div className="border-t mt-1 pt-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-primary"
              onClick={(e) => {
                e.preventDefault();
                setShowAddCustom(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Custom {isExpense ? "Category" : "Source"}
            </Button>
          </div>
        </SelectContent>
      </Select>

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
