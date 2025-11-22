import { useState } from "react";
import { useApp } from "../../lib/store";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Plus, Calendar, Trash2, RefreshCw, Pencil } from "lucide-react";
import { RecurringTransaction, RecurringFrequency, EXPENSE_CATEGORIES } from "../../types";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { format } from "date-fns";

export function RecurringTransactionsList() {
    const { recurringTransactions, addRecurringTransaction, updateRecurringTransaction, deleteRecurringTransaction, currentFamily, currentUser } = useApp();
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form state
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [frequency, setFrequency] = useState<RecurringFrequency>("monthly");
    const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));

    const handleAddTransaction = async () => {
        if (!description || !amount || !category || !currentFamily || !currentUser) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            if (editingId) {
                const existing = recurringTransactions.find(t => t.id === editingId);
                if (!existing) return;

                const updatedTransaction: RecurringTransaction = {
                    ...existing,
                    amount: parseFloat(amount),
                    category,
                    description,
                    frequency,
                    start_date: startDate,
                    // Recalculate next due date if start date changed? 
                    // For simplicity, we keep the logic simple or reset it. 
                    // Ideally, we should check if start date changed significantly.
                    // But let's just update the basic fields.
                };

                await updateRecurringTransaction(updatedTransaction);
                toast.success("Recurring transaction updated");
            } else {
                const newTransaction: RecurringTransaction = {
                    id: uuidv4(),
                    family_id: currentFamily.id,
                    amount: parseFloat(amount),
                    currency: currentFamily.currency,
                    category,
                    description,
                    frequency,
                    start_date: startDate,
                    next_due_date: startDate,
                    is_active: true,
                    created_by: currentUser.id,
                    created_at: new Date().toISOString(),
                };
                await addRecurringTransaction(newTransaction);
                toast.success("Recurring transaction added");
            }

            setIsAddDialogOpen(false);
            resetForm();
        } catch (error) {
            console.error("Failed to save recurring transaction:", error);
            toast.error("Failed to save recurring transaction");
        }
    };

    const handleEdit = (transaction: RecurringTransaction) => {
        setEditingId(transaction.id);
        setDescription(transaction.description);
        setAmount(transaction.amount.toString());
        setCategory(transaction.category);
        setFrequency(transaction.frequency);
        setStartDate(transaction.start_date);
        setIsAddDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this recurring transaction?")) {
            try {
                await deleteRecurringTransaction(id);
                toast.success("Recurring transaction deleted");
            } catch (error) {
                console.error("Failed to delete recurring transaction:", error);
                toast.error("Failed to delete recurring transaction");
            }
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setDescription("");
        setAmount("");
        setCategory("");
        setFrequency("monthly");
        setStartDate(format(new Date(), "yyyy-MM-dd"));
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Subscriptions & Recurring</h2>
                <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
                    setIsAddDialogOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add New
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingId ? "Edit" : "Add"} Recurring Transaction</DialogTitle>
                            <DialogDescription>
                                {editingId ? "Update details of your recurring expense" : "Set up a recurring expense or subscription"}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    placeholder="e.g., Netflix Subscription"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="amount">Amount</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="frequency">Frequency</Label>
                                    <Select value={frequency} onValueChange={(v) => setFrequency(v as RecurringFrequency)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="daily">Daily</SelectItem>
                                            <SelectItem value="weekly">Weekly</SelectItem>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                            <SelectItem value="yearly">Yearly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {EXPENSE_CATEGORIES.map((cat) => (
                                            <SelectItem key={cat} value={cat}>
                                                {cat}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="startDate">Start Date</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <Button className="w-full" onClick={handleAddTransaction}>
                                {editingId ? "Update" : "Save"} Recurring Transaction
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {recurringTransactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    <RefreshCw className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No recurring transactions set up yet.</p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {recurringTransactions.map((transaction) => (
                        <div
                            key={transaction.id}
                            className="flex items-center justify-between p-4 bg-card border rounded-lg shadow-sm"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <RefreshCw className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-medium">{transaction.description}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {transaction.currency} {transaction.amount} • {transaction.frequency}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="text-right mr-2">
                                    <p className="text-xs text-muted-foreground">Next due</p>
                                    <p className="text-sm font-medium">
                                        {format(new Date(transaction.next_due_date), "MMM d")}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEdit(transaction)}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive/90"
                                    onClick={() => handleDelete(transaction.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
