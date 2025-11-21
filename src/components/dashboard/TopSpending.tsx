import { useMemo } from "react";
import { useApp } from "../../lib/store";
import { formatCurrency } from "../../lib/utils";
import { ShoppingBag, ShoppingCart, Car, Utensils, Zap, Film, Heart, GraduationCap, MoreHorizontal, TrendingUp } from "lucide-react";

const categoryIcons: Record<string, any> = {
  groceries: ShoppingCart,
  food: Utensils,
  transport: Car,
  shopping: ShoppingBag,
  utilities: Zap,
  entertainment: Film,
  health: Heart,
  education: GraduationCap,
  other: MoreHorizontal,
};

const categoryColors: Record<string, string> = {
  groceries: "bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400",
  food: "bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400",
  transport: "bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
  shopping: "bg-pink-100 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400",
  utilities: "bg-purple-100 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400",
  entertainment: "bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400",
  health: "bg-teal-100 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400",
  education: "bg-indigo-100 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400",
  other: "bg-gray-100 dark:bg-gray-950/30 text-gray-600 dark:text-gray-400",
};

export function TopSpending() {
  const { expenses, currentUser, currentFamily } = useApp();

  const topCategories = useMemo(() => {
    // Get current month expenses
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const visibleExpenses = currentUser?.role === "admin"
      ? expenses
      : expenses.filter((e) => e.is_shared || e.created_by === currentUser?.id);

    const monthExpenses = visibleExpenses.filter(
      (e) => new Date(e.date) >= startOfMonth
    );

    // Group by category
    const categoryTotals: Record<string, number> = {};
    monthExpenses.forEach(exp => {
      if (!categoryTotals[exp.category]) {
        categoryTotals[exp.category] = 0;
      }
      categoryTotals[exp.category] += exp.total_amount;
    });

    const totalSpent = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

    // Convert to array and sort
    const categories = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5); // Top 5 categories

    return categories;
  }, [expenses, currentUser]);

  if (topCategories.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
        <h3>Top Spending</h3>
      </div>

      <div className="space-y-2">
        {topCategories.map(({ category, amount, percentage }) => {
          const Icon = categoryIcons[category] || MoreHorizontal;
          const colorClass = categoryColors[category] || categoryColors.other;

          return (
            <div
              key={category}
              className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:shadow-md transition-all duration-200"
            >
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium capitalize">{category}</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(amount, currentFamily?.currency)}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold text-lg">{percentage}%</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
