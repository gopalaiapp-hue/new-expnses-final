import { useState } from "react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { useApp } from "../../lib/store";
import { formatCurrency, formatDate, getCategoryIcon, getPaymentMethodIcon, getPaymentMethodLabel, getInitials } from "../../lib/utils";
import { Expense } from "../../types";
import { ExpenseDetailSheet } from "./ExpenseDetailSheet";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { type FilterState } from "../transaction/TransactionFilterDialog";

interface ExpenseListProps {
  filters?: FilterState;
}

export function ExpenseList({ filters }: ExpenseListProps) {
  const { currentUser, expenses, users } = useApp();
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // Filter expenses based on user role
  let visibleExpenses = currentUser?.role === "admin"
    ? expenses
    : expenses.filter(
        (e) => e.is_shared || e.created_by === currentUser?.id
      );

  // Apply active filters
  if (filters) {
    visibleExpenses = visibleExpenses.filter((expense) => {
      // Search filter (by category or notes)
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesSearch = 
          expense.category.toLowerCase().includes(query) ||
          (expense.notes && expense.notes.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      // Category filter
      if (filters.category !== "All Categories" && expense.category !== filters.category) {
        return false;
      }

      // Payment method filter
      if (filters.mode !== "All Modes") {
        const hasPaymentMethod = expense.payment_lines.some(line => line.method === filters.mode);
        if (!hasPaymentMethod) return false;
      }

      // Time range filter
      if (filters.timeRange !== "all") {
        const today = new Date();
        const expenseDate = new Date(expense.date);
        
        switch (filters.timeRange) {
          case "today":
            if (expenseDate.toDateString() !== today.toDateString()) return false;
            break;
          case "week":
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            if (expenseDate < weekAgo) return false;
            break;
          case "month":
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            if (expenseDate < monthAgo) return false;
            break;
        }
      }

      return true;
    });
  }

  const groupedExpenses = visibleExpenses.reduce((groups, expense) => {
    const dateKey = formatDate(expense.date);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(expense);
    return groups;
  }, {} as Record<string, Expense[]>);

  if (visibleExpenses.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center p-6 rounded-full bg-primary-container/30 mb-4">
          <div className="text-5xl">{filters?.searchQuery || Object.keys(filters || {}).some(k => filters![k as keyof FilterState] && filters![k as keyof FilterState] !== "all" && filters![k as keyof FilterState] !== "All Categories" && filters![k as keyof FilterState] !== "All Modes") ? "🔍" : "📝"}</div>
        </div>
        <p className="text-muted-foreground text-lg mb-2">
          {filters?.searchQuery || Object.keys(filters || {}).some(k => filters![k as keyof FilterState] && filters![k as keyof FilterState] !== "all" && filters![k as keyof FilterState] !== "All Categories" && filters![k as keyof FilterState] !== "All Modes") 
            ? "No expenses match your filters" 
            : "No expenses yet"}
        </p>
        <p className="text-sm text-muted-foreground">
          {filters?.searchQuery || Object.keys(filters || {}).some(k => filters![k as keyof FilterState] && filters![k as keyof FilterState] !== "all" && filters![k as keyof FilterState] !== "All Categories" && filters![k as keyof FilterState] !== "All Modes") 
            ? "Try adjusting your filters" 
            : `Tap the ${<span className="text-tertiary">+</span>} button to add your first expense`}
        </p>
      </div>
    );
  }

  const getCreatorName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user?.name || "Unknown";
  };

  return (
    <>
      <div className="space-y-6">
        {Object.entries(groupedExpenses).map(([date, dateExpenses]) => (
          <div key={date}>
            <h3 className="text-sm text-muted-foreground mb-3 px-1 uppercase tracking-wide">{date}</h3>
            <div className="space-y-3">
              {dateExpenses.map((expense) => {
                const creator = users.find((u) => u.id === expense.created_by);
                
                return (
                  <Card
                    key={expense.id}
                    className="p-4 elevation-1 hover:elevation-3 cursor-pointer transition-all duration-200 bg-card hover:bg-surface-variant/30 border-outline-variant/20 overflow-hidden"
                    onClick={() => setSelectedExpense(expense)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="text-3xl p-2 rounded-xl bg-primary-container/30 shrink-0">
                          {getCategoryIcon(expense.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="truncate font-medium">{expense.category}</h4>
                            {expense.payment_lines.length > 1 && (
                              <Badge variant="secondary" className="text-xs bg-secondary-container/50 text-on-secondary-container">
                                Split
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {expense.payment_lines.map((line) => (
                              <span key={line.id} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-surface-variant/50 text-on-surface-variant">
                                {getPaymentMethodIcon(line.method)}{" "}
                                {formatCurrency(line.amount, expense.currency)}
                              </span>
                            ))}
                          </div>
                          {expense.notes && (
                            <p className="text-sm text-muted-foreground mt-2 truncate">
                              {expense.notes}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Avatar className="h-6 w-6 border border-outline-variant">
                              <AvatarFallback className="text-xs bg-primary-container text-on-primary-container">
                                {creator ? getInitials(creator.name) : "?"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">
                              {getCreatorName(expense.created_by)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xl font-medium text-destructive">
                          {formatCurrency(expense.total_amount, expense.currency)}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {selectedExpense && (
        <ExpenseDetailSheet
          expense={selectedExpense}
          open={!!selectedExpense}
          onClose={() => setSelectedExpense(null)}
        />
      )}
    </>
  );
}
