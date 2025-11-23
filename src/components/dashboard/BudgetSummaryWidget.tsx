import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { useApp } from "../../lib/store";
import { useLanguage } from "../../lib/language";
import { ArrowRight, TrendingUp, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";

export function BudgetSummaryWidget() {
    const { budgets, expenses } = useApp();
    const { t } = useLanguage();

    const budgetStats = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Filter for monthly budgets only for now
        const activeBudgets = budgets.filter(b => b.period === "monthly");

        if (activeBudgets.length === 0) return null;

        const totalBudgetLimit = activeBudgets.reduce((sum, b) => sum + b.limit_amount, 0);

        // Calculate total spent in the current month for categories that have budgets
        const budgetedCategories = new Set(activeBudgets.map(b => b.category));

        const currentMonthExpenses = expenses.filter(e => {
            const expenseDate = new Date(e.date);
            if (isNaN(expenseDate.getTime())) return false;

            return (
                expenseDate.getMonth() === currentMonth &&
                expenseDate.getFullYear() === currentYear &&
                budgetedCategories.has(e.category)
            );
        });

        const totalSpent = currentMonthExpenses.reduce((sum, e) => sum + e.total_amount, 0);
        const percentage = Math.min(Math.round((totalSpent / totalBudgetLimit) * 100), 100);

        // Determine status color
        let statusColor = "bg-primary";
        if (percentage >= 90) statusColor = "bg-destructive";
        else if (percentage >= 75) statusColor = "bg-orange-500";

        return {
            totalBudgetLimit,
            totalSpent,
            percentage,
            statusColor,
            count: activeBudgets.length
        };
    }, [budgets, expenses]);

    if (!budgetStats) return null;

    return (
        <Card className="bg-gradient-to-br from-surface-variant/30 to-surface-variant/10 border-surface-variant/50 overflow-hidden">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        {t('monthly_budget')}
                    </CardTitle>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-surface-variant text-on-surface-variant">
                        {budgetStats.count} {t('categories')}
                    </span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="flex justify-between items-end">
                        <div>
                            <span className="text-2xl font-bold">
                                ₹{budgetStats.totalSpent.toLocaleString('en-IN')}
                            </span>
                            <span className="text-sm text-muted-foreground ml-1">
                                / ₹{budgetStats.totalBudgetLimit.toLocaleString('en-IN')}
                            </span>
                        </div>
                        <span className={`font-bold ${budgetStats.percentage >= 90 ? "text-destructive" :
                            budgetStats.percentage >= 75 ? "text-orange-600" : "text-primary"
                            }`}>
                            {budgetStats.percentage}%
                        </span>
                    </div>

                    <Progress value={budgetStats.percentage} className="h-2" indicatorClassName={budgetStats.statusColor} />

                    {budgetStats.percentage >= 90 && (
                        <div className="flex items-center gap-2 text-xs text-destructive mt-2 bg-destructive/10 p-2 rounded-lg">
                            <AlertCircle className="h-3 w-3" />
                            <span>You've almost reached your budget limit!</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
