import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "../ui/sheet";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Edit2, ArrowLeft, Calendar, TrendingUp, RefreshCw, User } from "lucide-react";
import { useApp } from "../../lib/store";
import { Income } from "../../types";
import { formatCurrency, formatDateTime, getInitials } from "../../lib/utils";
import { toast } from "sonner";

interface IncomeDetailSheetProps {
    income: Income;
    open: boolean;
    onClose: () => void;
}

export function IncomeDetailSheet({ income, open, onClose }: IncomeDetailSheetProps) {
    const { users, currentUser, updateIncome } = useApp();
    const [isEditing, setIsEditing] = useState(false);
    const [editAmount, setEditAmount] = useState(income.amount.toString());
    const [editSource, setEditSource] = useState(income.source);

    const creator = users.find((u) => u.id === income.created_by);
    const canEdit = currentUser?.id === income.created_by || currentUser?.role === "admin";

    const handleSaveEdit = async () => {
        const newAmount = parseFloat(editAmount);
        if (isNaN(newAmount) || newAmount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        try {
            await updateIncome({
                ...income,
                amount: newAmount,
                source: editSource,
                updated_at: new Date().toISOString(),
            });

            toast.success("Income updated successfully ✓");
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update income:", error);
            toast.error("Failed to update income");
        }
    };

    const handleCancelEdit = () => {
        setEditAmount(income.amount.toString());
        setEditSource(income.source);
        setIsEditing(false);
    };

    return (
        <Sheet open={open} onOpenChange={(open) => !open && (isEditing ? handleCancelEdit() : onClose())}>
            <SheetContent side="right" className="ml-auto w-full max-w-lg overflow-y-auto bg-background border-l">
                {/* Header */}
                <div className="flex items-center justify-between p-4 pb-3 border-b sticky top-0 bg-background z-10">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={isEditing ? handleCancelEdit : onClose}
                        className="shrink-0"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>

                    <div className="flex-1 text-center">
                        <SheetTitle className="flex items-center justify-center gap-2 text-green-600">
                            <TrendingUp className="h-5 w-5" />
                            Income Details
                        </SheetTitle>
                        <SheetDescription className="flex items-center justify-center gap-1 mt-1">
                            <Calendar className="h-3 w-3" />
                            {formatDateTime(income.date)}
                        </SheetDescription>
                    </div>

                    {canEdit && !isEditing && (
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setIsEditing(true)}
                            className="shrink-0"
                        >
                            <Edit2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {/* Main Content */}
                <div className="px-6 py-4 space-y-6">

                    {/* Amount Section */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-6 rounded-2xl border border-green-100 dark:border-green-900">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-green-700 dark:text-green-300">Amount</span>
                            {isEditing && (
                                <Button
                                    onClick={handleSaveEdit}
                                    size="sm"
                                    className="gap-1 bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <RefreshCw className="h-3 w-3" />
                                    Save
                                </Button>
                            )}
                        </div>

                        {isEditing ? (
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    ₹
                                </span>
                                <Input
                                    type="number"
                                    value={editAmount}
                                    onChange={(e) => setEditAmount(e.target.value)}
                                    className="pl-8 h-12 text-2xl font-bold bg-background border-green-200 dark:border-green-800"
                                    step="0.01"
                                />
                            </div>
                        ) : (
                            <div className="text-3xl font-bold text-green-700 dark:text-green-400">
                                {formatCurrency(income.amount, income.currency)}
                            </div>
                        )}
                    </div>

                    {/* Source Section */}
                    <div className="bg-surface-variant/50 p-4 rounded-xl border">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm font-medium text-muted-foreground">Source</span>
                        </div>

                        {isEditing ? (
                            <Select value={editSource} onValueChange={setEditSource}>
                                <SelectTrigger className="bg-background">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Salary">💰 Salary</SelectItem>
                                    <SelectItem value="Freelance">💻 Freelance</SelectItem>
                                    <SelectItem value="Business">🏢 Business</SelectItem>
                                    <SelectItem value="Investment">📈 Investment</SelectItem>
                                    <SelectItem value="Gift">🎁 Gift</SelectItem>
                                    <SelectItem value="Other">📝 Other</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className="text-lg font-medium">
                                {income.source}
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    {income.notes && (
                        <div className="bg-muted/30 p-4 rounded-xl">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                📝 Notes
                            </h3>
                            <p className="text-sm text-muted-foreground">{income.notes}</p>
                        </div>
                    )}

                    {/* Metadata */}
                    <div className="bg-surface-variant/30 p-4 rounded-xl space-y-3">
                        <h3 className="font-semibold text-sm mb-3">Details</h3>

                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Created by</span>
                            <div className="flex items-center gap-2">
                                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                                    {creator ? getInitials(creator.name) : "?"}
                                </div>
                                <span className="font-medium">{creator?.name || "Unknown"}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Visibility</span>
                            <Badge variant={income.is_shared ? "default" : "secondary"} className="text-xs">
                                {income.is_shared ? "Shared" : "Private"}
                            </Badge>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
