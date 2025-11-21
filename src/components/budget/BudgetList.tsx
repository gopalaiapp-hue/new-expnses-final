import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { useApp } from "../../lib/store";
import { formatCurrency, getCategoryIcon } from "../../lib/utils";
import { Budget } from "../../types";
import { AlertCircle, TrendingUp } from "lucide-react";

export function BudgetList() {
  const { currentUser, currentFamily, budgets, expenses } = useApp();

  const budgetProgress = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    return budgets.map((budget) => {
      const periodStart = budget.period === "monthly" ? startOfMonth : startOfWeek;
      
      // Filter expenses for this budget's period and category
      const relevantExpenses = expenses.filter(
        (e) =>
          e.category === budget.category &&
          new Date(e.date) >= periodStart &&
          (currentUser?.role === "admin" || e.is_shared || e.created_by === currentUser?.id)
      );

      const spent = relevantExpenses.reduce((sum, e) => sum + e.total_amount, 0);
      const percentage = (spent / budget.limit_amount) * 100;
      const isOverBudget = spent > budget.limit_amount;
      const isNearLimit = percentage >= budget.notify_threshold_percent && !isOverBudget;
      const remaining = budget.limit_amount - spent;

      return {
        ...budget,
        spent,
        percentage: Math.min(percentage, 100),
        isOverBudget,
        isNearLimit,
        remaining,
      };
    });
  }, [budgets, expenses, currentUser]);

  if (budgets.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">💰</div>
        <p className="text-muted-foreground">No budgets set yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Tap 'Add Budget' to create your first budget
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {budgetProgress.map((budget) => (
        <Card
          key={budget.id}
          className={
            budget.isOverBudget
              ? "border-red-300 bg-red-50/50"
              : budget.isNearLimit
              ? "border-orange-300 bg-orange-50/50"
              : ""
          }
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getCategoryIcon(budget.category)}</span>
                <div>
                  <CardTitle className="text-base">{budget.category}</CardTitle>
                  <p className="text-xs text-muted-foreground capitalize">
                    {budget.period} budget
                  </p>
                </div>
              </div>
              {budget.isOverBudget ? (
                <Badge variant="destructive" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Over Budget
                </Badge>
              ) : budget.isNearLimit ? (
                <Badge variant="secondary" className="gap-1 bg-orange-100 text-orange-700 border-orange-300">
                  <TrendingUp className="h-3 w-3" />
                  {budget.notify_threshold_percent}% reached
                </Badge>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-end justify-between text-sm">
              <div>
                <span className="text-muted-foreground">Spent: </span>
                <span className={budget.isOverBudget ? "font-semibold text-red-600" : "font-semibold"}>
                  {formatCurrency(budget.spent, currentFamily?.currency)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Limit: </span>
                <span className="font-semibold">
                  {formatCurrency(budget.limit_amount, currentFamily?.currency)}
                </span>
              </div>
            </div>
            <Progress
              value={budget.percentage}
              className={budget.isOverBudget ? "bg-red-200" : budget.isNearLimit ? "bg-orange-200" : ""}
            />
            <div className="flex justify-between text-xs">
              <span className={budget.remaining >= 0 ? "text-green-600" : "text-red-600"}>
                {budget.remaining >= 0
                  ? `${formatCurrency(budget.remaining, currentFamily?.currency)} remaining`
                  : `${formatCurrency(Math.abs(budget.remaining), currentFamily?.currency)} over`}
              </span>
              <span className="text-muted-foreground">
                {budget.percentage.toFixed(0)}% used
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
