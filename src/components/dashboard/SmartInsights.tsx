import { useApp } from "../../lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Lightbulb, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { useLanguage } from "../../lib/language";
import { startOfWeek, endOfWeek, subWeeks, startOfMonth, endOfMonth, subMonths, isWithinInterval } from "date-fns";

export function SmartInsights() {
    const { expenses, income, currentFamily } = useApp();
    const { t } = useLanguage();

    if (!currentFamily) return null;

    const currency = currentFamily.currency;

    // Helper to get total expenses for a date range
    const getExpensesForRange = (start: Date, end: Date) => {
        return expenses
            .filter(e => isWithinInterval(new Date(e.date), { start, end }))
            .reduce((sum, e) => sum + e.amount, 0);
    };

    // Helper to get total income for a date range
    const getIncomeForRange = (start: Date, end: Date) => {
        return income
            .filter(i => isWithinInterval(new Date(i.date), { start, end }))
            .reduce((sum, i) => sum + i.amount, 0);
    };

    // Time ranges
    const now = new Date();
    const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
    const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    // Calculations
    const thisWeekExpenses = getExpensesForRange(thisWeekStart, thisWeekEnd);
    const lastWeekExpenses = getExpensesForRange(lastWeekStart, lastWeekEnd);

    const thisMonthIncome = getIncomeForRange(thisMonthStart, thisMonthEnd);
    const thisMonthExpenses = getExpensesForRange(thisMonthStart, thisMonthEnd);
    const thisMonthSavings = thisMonthIncome - thisMonthExpenses;

    const lastMonthIncome = getIncomeForRange(lastMonthStart, lastMonthEnd);
    const lastMonthExpenses = getExpensesForRange(lastMonthStart, lastMonthEnd);
    const lastMonthSavings = lastMonthIncome - lastMonthExpenses;

    // Generate Insights
    const insights = [];

    // 1. Weekly Spending Comparison
    if (thisWeekExpenses > lastWeekExpenses && lastWeekExpenses > 0) {
        const percentIncrease = Math.round(((thisWeekExpenses - lastWeekExpenses) / lastWeekExpenses) * 100);
        insights.push({
            icon: <TrendingUp className="h-5 w-5 text-destructive" />,
            title: "Spending Alert",
            message: `You spent ${percentIncrease}% more this week compared to last week.`,
            color: "bg-destructive/10 text-destructive-foreground"
        });
    } else if (thisWeekExpenses < lastWeekExpenses && thisWeekExpenses > 0) {
        const percentDecrease = Math.round(((lastWeekExpenses - thisWeekExpenses) / lastWeekExpenses) * 100);
        insights.push({
            icon: <TrendingDown className="h-5 w-5 text-green-600" />,
            title: "Good Job!",
            message: `You've spent ${percentDecrease}% less this week than last week. Keep it up!`,
            color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
        });
    }

    // 2. Monthly Savings Comparison
    if (thisMonthSavings > lastMonthSavings && lastMonthSavings > 0) {
        const extraSaved = thisMonthSavings - lastMonthSavings;
        insights.push({
            icon: <Lightbulb className="h-5 w-5 text-yellow-600" />,
            title: "Savings Growth",
            message: `Great job! You saved ${currency} ${extraSaved.toLocaleString()} more than usual this month.`,
            color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
        });
    }

    // 3. High Spending Category (Simple check: if any category is > 40% of total expenses this month)
    if (thisMonthExpenses > 0) {
        const categoryTotals: Record<string, number> = {};
        expenses
            .filter(e => isWithinInterval(new Date(e.date), { start: thisMonthStart, end: thisMonthEnd }))
            .forEach(e => {
                categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
            });

        const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
        if (topCategory && (topCategory[1] / thisMonthExpenses) > 0.4) {
            insights.push({
                icon: <AlertCircle className="h-5 w-5 text-orange-600" />,
                title: "Spending Insight",
                message: `Heads up! ${topCategory[0]} makes up ${Math.round((topCategory[1] / thisMonthExpenses) * 100)}% of your spending this month.`,
                color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
            });
        }
    }

    // Fallback if no specific insights
    if (insights.length === 0 && expenses.length > 0) {
        insights.push({
            icon: <Lightbulb className="h-5 w-5 text-primary" />,
            title: "Tip",
            message: "Track your daily expenses to get better insights!",
            color: "bg-primary/10 text-primary-foreground"
        });
    }

    if (insights.length === 0) return null;

    // Show max 2 insights
    const displayInsights = insights.slice(0, 2);

    return (
        <div className="space-y-3">
            {displayInsights.map((insight, index) => (
                <div key={index} className={`p-4 rounded-xl border flex items-start gap-3 ${insight.color}`}>
                    <div className="shrink-0 mt-0.5">{insight.icon}</div>
                    <div>
                        <h4 className="font-semibold text-sm">{insight.title}</h4>
                        <p className="text-sm opacity-90">{insight.message}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
