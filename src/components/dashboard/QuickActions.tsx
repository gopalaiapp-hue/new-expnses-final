import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { Plus, TrendingDown, TrendingUp, Target, Users, Receipt, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

interface QuickActionsProps {
    onAddExpense: () => void;
    onAddIncome: () => void;
    onAddGoal: () => void; // We might need to route this
    onSettleDebt: () => void; // We might need to route this
}

export function QuickActions({ onAddExpense, onAddIncome, onAddGoal, onSettleDebt }: QuickActionsProps) {
    const [open, setOpen] = useState(false);

    const handleAction = (action: () => void) => {
        Haptics.impact({ style: ImpactStyle.Light });
        setOpen(false);
        // Small delay to allow sheet to close smoothly
        setTimeout(action, 150);
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    size="icon"
                    className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-transform hover:scale-105 active:scale-95"
                    onClick={() => Haptics.impact({ style: ImpactStyle.Medium })}
                >
                    <Plus className={`h-8 w-8 transition-transform duration-300 ${open ? "rotate-45" : ""}`} />
                </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="pb-8 rounded-t-3xl">
                <SheetHeader className="mb-6 text-center">
                    <SheetTitle>Quick Actions</SheetTitle>
                </SheetHeader>

                <div className="grid grid-cols-2 gap-4">
                    <Button
                        variant="outline"
                        className="h-24 flex flex-col gap-2 border-2 hover:border-red-500/50 hover:bg-red-50 dark:hover:bg-red-950/20"
                        onClick={() => handleAction(onAddExpense)}
                    >
                        <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600">
                            <TrendingDown className="h-6 w-6" />
                        </div>
                        <span className="font-medium">Add Expense</span>
                    </Button>

                    <Button
                        variant="outline"
                        className="h-24 flex flex-col gap-2 border-2 hover:border-green-500/50 hover:bg-green-50 dark:hover:bg-green-950/20"
                        onClick={() => handleAction(onAddIncome)}
                    >
                        <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <span className="font-medium">Add Income</span>
                    </Button>

                    <Button
                        variant="outline"
                        className="h-24 flex flex-col gap-2 border-2 hover:border-blue-500/50 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                        onClick={() => handleAction(onAddGoal)}
                    >
                        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600">
                            <Target className="h-6 w-6" />
                        </div>
                        <span className="font-medium">New Goal</span>
                    </Button>

                    <Button
                        variant="outline"
                        className="h-24 flex flex-col gap-2 border-2 hover:border-orange-500/50 hover:bg-orange-50 dark:hover:bg-orange-950/20"
                        onClick={() => handleAction(onSettleDebt)}
                    >
                        <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600">
                            <Users className="h-6 w-6" />
                        </div>
                        <span className="font-medium">Settle Debt</span>
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
