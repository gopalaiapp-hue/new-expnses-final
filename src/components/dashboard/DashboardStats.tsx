import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useApp } from "../../lib/store";
import { formatCurrency } from "../../lib/utils";
import { useMemo } from "react";
import { TrendingUp, TrendingDown, Wallet, Users } from "lucide-react";

export function DashboardStats() {
  const { currentUser, currentFamily, expenses, income, debts, users } = useApp();

  const stats = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Filter expenses based on role
    const visibleExpenses = currentUser?.role === "admin"
      ? expenses
      : expenses.filter((e) => e.is_shared || e.created_by === currentUser?.id);

    const visibleIncome = currentUser?.role === "admin"
      ? income
      : income.filter((i) => i.is_shared || i.created_by === currentUser?.id);

    const todayExpenses = visibleExpenses.filter(
      (e) => new Date(e.date) >= startOfToday
    );
    const monthExpenses = visibleExpenses.filter(
      (e) => new Date(e.date) >= startOfMonth
    );

    const monthIncome = visibleIncome.filter(
      (i) => new Date(i.date) >= startOfMonth
    );

    const todayTotal = todayExpenses.reduce((sum, e) => sum + e.total_amount, 0);
    const monthTotal = monthExpenses.reduce((sum, e) => sum + e.total_amount, 0);
    const monthIncomeTotal = monthIncome.reduce((sum, i) => sum + i.amount, 0);

    // Debt calculations
    const myDebts = debts.filter(
      (d) => d.status === "open" && d.borrower_user_id === currentUser?.id
    );
    const owedToMe = debts.filter(
      (d) => d.status === "open" && d.lender_user_id === currentUser?.id
    );

    const totalOwed = myDebts.reduce((sum, d) => sum + d.amount, 0);
    const totalOwedToMe = owedToMe.reduce((sum, d) => sum + d.amount, 0);

    return {
      todayTotal,
      monthTotal,
      monthIncomeTotal,
      todayCount: todayExpenses.length,
      monthCount: monthExpenses.length,
      totalOwed,
      totalOwedToMe,
      activeMembers: users.length,
      netBalance: monthIncomeTotal - monthTotal,
    };
  }, [expenses, income, debts, currentUser, users]);

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Expense Card - Stitch Style */}
      <Card className="bg-error-container/30 border-destructive/20 elevation-1 hover:elevation-3 transition-all duration-300 overflow-hidden">
        <CardHeader className="pb-3">
          <CardDescription className="flex items-center gap-1.5 text-on-error-container">
            <span className="inline-flex p-1.5 rounded-full bg-destructive/10">
              <TrendingDown className="h-3.5 w-3.5" />
            </span>
            <span>Expenses (Month)</span>
          </CardDescription>
          <CardTitle className="text-destructive text-2xl">
            {formatCurrency(stats.monthTotal, currentFamily?.currency)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            {stats.monthCount} {stats.monthCount === 1 ? "expense" : "expenses"}
          </p>
        </CardContent>
      </Card>

      {/* Income Card - Stitch Style */}
      <Card className="bg-success-container/20 border-success/20 elevation-1 hover:elevation-3 transition-all duration-300 overflow-hidden">
        <CardHeader className="pb-3">
          <CardDescription className="flex items-center gap-1.5 text-on-success-container">
            <span className="inline-flex p-1.5 rounded-full bg-success/10">
              <TrendingUp className="h-3.5 w-3.5" />
            </span>
            <span>Income (Month)</span>
          </CardDescription>
          <CardTitle className="text-success text-2xl">
            {formatCurrency(stats.monthIncomeTotal, currentFamily?.currency)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Net: <span className={stats.netBalance >= 0 ? "text-success" : "text-destructive"}>
              {formatCurrency(stats.netBalance, currentFamily?.currency)}
            </span>
          </p>
        </CardContent>
      </Card>



      {/* Family Members Card */}
      {currentUser?.role === "admin" && (
        <Card className="bg-primary-container/30 border-primary/20 elevation-1 hover:elevation-3 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1.5 text-on-primary-container">
              <span className="inline-flex p-1.5 rounded-full bg-primary/10">
                <Users className="h-3.5 w-3.5" />
              </span>
              <span>Family Members</span>
            </CardDescription>
            <CardTitle className="text-xl text-primary">{stats.activeMembers}</CardTitle>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
