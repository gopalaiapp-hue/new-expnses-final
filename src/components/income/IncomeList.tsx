import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { useApp } from "../../lib/store";
import { formatCurrency, formatDate } from "../../lib/utils";
import { TrendingUp, User } from "lucide-react";
import { type FilterState } from "../transaction/TransactionFilterDialog";

interface IncomeListProps {
  filters?: FilterState;
}

export function IncomeList({ filters }: IncomeListProps) {
  const { income, users, currentUser } = useApp();

  // Apply filters
  let filteredIncome = income;
  
  if (filters) {
    filteredIncome = income.filter((inc) => {
      // Search filter (by source or notes)
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesSearch = 
          inc.source.toLowerCase().includes(query) ||
          (inc.notes && inc.notes.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      // Time range filter
      if (filters.timeRange !== "all") {
        const today = new Date();
        const incomeDate = new Date(inc.date);
        
        switch (filters.timeRange) {
          case "today":
            if (incomeDate.toDateString() !== today.toDateString()) return false;
            break;
          case "week":
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            if (incomeDate < weekAgo) return false;
            break;
          case "month":
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            if (incomeDate < monthAgo) return false;
            break;
        }
      }

      return true;
    });
  }

  if (filteredIncome.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {filters?.searchQuery || (filters?.timeRange && filters.timeRange !== "all") 
              ? "No income matches your filters" 
              : "No income recorded yet"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {filters?.searchQuery || (filters?.timeRange && filters.timeRange !== "all") 
              ? "Try adjusting your filters" 
              : "Add your first income to start tracking"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {filteredIncome.map((inc) => {
        const creator = users.find((u) => u.id === inc.created_by);
        const isOwn = inc.created_by === currentUser?.id;

        return (
          <Card key={inc.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-green-600">+ {formatCurrency(inc.amount)}</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{inc.source}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{formatDate(new Date(inc.date))}</p>
                  {creator && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <User className="h-3 w-3" />
                      <span>{isOwn ? "You" : creator.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            {inc.notes && (
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">{inc.notes}</p>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
