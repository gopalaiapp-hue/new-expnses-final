import { useState } from "react";
import { useApp } from "../../lib/store";
import { useLanguage } from "../../lib/language";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Plus, Trash2, Tag, Smile } from "lucide-react";
import { EXPENSE_CATEGORIES, INCOME_SOURCES, CustomCategory } from "../../types";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

const COMMON_EMOJIS = [
    "🛒", "🥦", "🥛", "🧹", "🏠", "⚡", "🛺", "⛽", "☕", "🍽️", "💊", "📚", "🎬", "🛍️", "🪔", "💇", "🎁", "📱", "📝",
    "💰", "💼", "💻", "📈", "🏘️", "🔧", "➕",
    "🍔", "🍻", "✈️", "🎮", "👗", "🏋️", "👶", "🐾", "🎨", "🎵", "💵", "🏦",
    "📷", "🚲", "🚕", "🚌", "🚂", "🏥", "🦷", "🕶️", "🧥", "👠"
];

export function CategorySettings() {
    const { customCategories, addCustomCategory, deleteCustomCategory, currentFamily, currentUser } = useApp();
    const { t } = useLanguage();
    const [newCategoryName, setNewCategoryName] = useState("");
    const [selectedEmoji, setSelectedEmoji] = useState("🏷️");
    const [activeTab, setActiveTab] = useState<"expense" | "income">("expense");
    const [isEmojiOpen, setIsEmojiOpen] = useState(false);

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;
        if (!currentFamily || !currentUser) return;

        const newCategory: CustomCategory = {
            id: uuidv4(),
            family_id: currentFamily.id,
            name: newCategoryName.trim(),
            type: activeTab,
            icon: selectedEmoji,
            created_by: currentUser.id,
            created_at: new Date().toISOString(),
        };

        try {
            await addCustomCategory(newCategory);
            setNewCategoryName("");
            setSelectedEmoji("🏷️");
            toast.success("Category added successfully");
        } catch (error) {
            console.error("Failed to add category:", error);
            toast.error("Failed to add category");
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (confirm("Are you sure you want to delete this category?")) {
            try {
                await deleteCustomCategory(id);
                toast.success("Category deleted");
            } catch (error) {
                console.error("Failed to delete category:", error);
                toast.error("Failed to delete category");
            }
        }
    };

    const filteredCustomCategories = customCategories.filter(c => c.type === activeTab);
    const defaultCategories = activeTab === "expense" ? EXPENSE_CATEGORIES : INCOME_SOURCES;

    return (
        <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "expense" | "income")}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="expense">Expense Categories</TabsTrigger>
                    <TabsTrigger value="income">Income Sources</TabsTrigger>
                </TabsList>

                <div className="mt-4 space-y-4">
                    <div className="flex gap-2">
                        <Popover open={isEmojiOpen} onOpenChange={setIsEmojiOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="icon" className="shrink-0">
                                    <span className="text-lg">{selectedEmoji}</span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-2">
                                <div className="grid grid-cols-6 gap-1">
                                    {COMMON_EMOJIS.map((emoji) => (
                                        <button
                                            key={emoji}
                                            className="h-8 w-8 flex items-center justify-center rounded hover:bg-accent text-lg"
                                            onClick={() => {
                                                setSelectedEmoji(emoji);
                                                setIsEmojiOpen(false);
                                            }}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>

                        <div className="flex-1">
                            <Label htmlFor="new-category" className="sr-only">New Category</Label>
                            <Input
                                id="new-category"
                                placeholder={`Add new ${activeTab} category...`}
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                            />
                        </div>
                        <Button onClick={handleAddCategory} disabled={!newCategoryName.trim()}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Custom Categories</h3>
                        {filteredCustomCategories.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic">No custom categories yet.</p>
                        ) : (
                            <div className="grid gap-2">
                                {filteredCustomCategories.map((category) => (
                                    <div
                                        key={category.id}
                                        className="flex items-center justify-between p-3 bg-card border rounded-lg"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{category.icon || "🏷️"}</span>
                                            <span>{category.name}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive/90"
                                            onClick={() => handleDeleteCategory(category.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2 pt-4 border-t">
                        <h3 className="text-sm font-medium text-muted-foreground">Default Categories</h3>
                        <div className="flex flex-wrap gap-2">
                            {defaultCategories.map((cat) => (
                                <div
                                    key={cat}
                                    className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                                >
                                    {cat}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Tabs>
        </div>
    );
}
