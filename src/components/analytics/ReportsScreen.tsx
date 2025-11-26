import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ArrowLeft, TrendingUp, TrendingDown, Receipt, PieChart as PieChartIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useApp } from "../../lib/store";
import { Income, DebtRecord, Budget, Goal } from "../../types";
import { formatCurrency } from "../../lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from "recharts";

interface ReportsScreenProps {
  onBack: () => void;
}

const COLORS = {
  groceries: "#10b981",
  food: "#f59e0b",
  transport: "#3b82f6",
  shopping: "#ec4899",
  utilities: "#8b5cf6",
  entertainment: "#ef4444",
  health: "#14b8a6",
  education: "#6366f1",
  other: "#6b7280",
};

const PAYMENT_COLORS = {
  cash: "#10b981",
  upi: "#3b82f6",
  card: "#8b5cf6",
  bank: "#f59e0b",
};

export function ReportsScreen({ onBack }: ReportsScreenProps) {
  const { expenses, income, debts, budgets, goals, accounts, currentFamily, currentUser } = useApp();

  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    // Filtered expenses by date range
    let filteredExpenses = expenses;
    if (dateRange.from) {
      filteredExpenses = filteredExpenses.filter((e) => new Date(e.date) >= dateRange.from!);
    }
    if (dateRange.to) {
      filteredExpenses = filteredExpenses.filter((e) => new Date(e.date) <= dateRange.to!);
    }

    const totalSpent = filteredExpenses.reduce((sum, exp) => sum + exp.total_amount, 0);
    const transactionCount = filteredExpenses.length;
    const averageTransaction = transactionCount > 0 ? totalSpent / transactionCount : 0;

    // Get unique categories count
    const categories = new Set(filteredExpenses.map(exp => exp.category));

    return {
      totalSpent,
      filteredExpenses,
      transactionCount,
      averageTransaction,
      categoriesUsed: categories.size
    };
  }, [expenses, dateRange]);

  // Category breakdown for pie chart
  const categoryData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};

    expenses.forEach(exp => {
      if (!categoryTotals[exp.category]) {
        categoryTotals[exp.category] = 0;
      }
      categoryTotals[exp.category] += exp.total_amount;
    });

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        percentage: ((value / summaryStats.totalSpent) * 100).toFixed(1)
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses, summaryStats.totalSpent]);

  // 6-month trend data
  const trendData = useMemo(() => {
    const monthlyData: Record<string, number> = {};
    const now = new Date();

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyData[monthKey] = 0;
    }

    // Aggregate expenses by month
    expenses.forEach(exp => {
      const expDate = new Date(exp.date);
      const monthKey = expDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (monthlyData.hasOwnProperty(monthKey)) {
        monthlyData[monthKey] += exp.total_amount;
      }
    });

    return Object.entries(monthlyData).map(([month, amount]) => ({
      month,
      amount
    }));
  }, [expenses]);

  // Payment method distribution
  const paymentMethodData = useMemo(() => {
    const methodTotals: Record<string, number> = {};

    expenses.forEach(exp => {
      exp.payment_lines.forEach(line => {
        // Determine payment method from account_id
        // Determine payment method from account_id
        let method = "other";
        if (line.account_id === "cash" || line.method === "cash") method = "cash";
        else if (line.account_id === "upi" || line.method === "upi") method = "upi";
        else if ((line.account_id && line.account_id.includes("card")) || line.method === "card") method = "card";
        else if (line.account_id || line.method === "bank") method = "bank";

        if (!methodTotals[method]) {
          methodTotals[method] = 0;
        }
        methodTotals[method] += line.amount;
      });
    });

    return Object.entries(methodTotals)
      .map(([name, value]) => ({
        name: name.toUpperCase(),
        value,
        percentage: ((value / summaryStats.totalSpent) * 100).toFixed(1)
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses, summaryStats.totalSpent]);

  // Debt Data
  const debtData = useMemo(() => {
    if (!currentFamily || !currentUser) return [];

    const youOwe = debts
      .filter(d => d.borrower_user_id === currentUser.id && d.status === "open")
      .reduce((sum, d) => sum + d.amount, 0);

    const owedToYou = debts
      .filter(d => d.lender_user_id === currentUser.id && d.status === "open")
      .reduce((sum, d) => sum + d.amount, 0);

    return [
      { name: "You Owe", value: youOwe, fill: "#ef4444" },
      { name: "Owed to You", value: owedToYou, fill: "#10b981" }
    ].filter(d => d.value > 0);
  }, [debts, currentUser, currentFamily]);

  // Goal Progress Data (Top 5 active goals)
  const goalData = useMemo(() => {
    return goals
      .filter(g => g.is_active)
      .sort((a, b) => (b.current_amount / b.target_amount) - (a.current_amount / a.target_amount))
      .slice(0, 5)
      .map(g => ({
        name: g.goal_name,
        saved: g.current_amount,
        remaining: g.target_amount - g.current_amount,
        target: g.target_amount
      }));
  }, [goals]);

  // Account Balances
  const accountData = useMemo(() => {
    return accounts.map(a => ({
      name: a.name,
      balance: a.current_balance
    })).sort((a, b) => b.balance - a.balance);
  }, [accounts]);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-primary text-primary-foreground elevation-2 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-primary-foreground hover:bg-primary-foreground/10 shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1>Reports & Analytics</h1>
              <p className="text-sm opacity-90">Visual spending insights</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-1 text-xs">
                <TrendingDown className="h-3 w-3" />
                Total Spent
              </CardDescription>
              <CardTitle className="text-2xl text-destructive">
                {formatCurrency(summaryStats.totalSpent)}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-1 text-xs">
                <Receipt className="h-3 w-3" />
                Transactions
              </CardDescription>
              <CardTitle className="text-2xl text-primary">
                {summaryStats.transactionCount}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-br from-tertiary/10 to-tertiary/5 border-tertiary/20">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-1 text-xs">
                <TrendingUp className="h-3 w-3" />
                Average
              </CardDescription>
              <CardTitle className="text-2xl text-tertiary">
                {formatCurrency(summaryStats.averageTransaction)}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-1 text-xs">
                <PieChartIcon className="h-3 w-3" />
                Categories
              </CardDescription>
              <CardTitle className="text-2xl text-success">
                {summaryStats.categoriesUsed}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Category Breakdown - Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>Distribution of expenses across categories</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS] || COLORS.other} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Category List */}
                <div className="space-y-2">
                  {categoryData.map((category) => (
                    <div key={category.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: COLORS[category.name.toLowerCase() as keyof typeof COLORS] || COLORS.other }}
                        />
                        <span className="capitalize">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(category.value)}</p>
                        <p className="text-xs text-muted-foreground">{category.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <PieChartIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No expense data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 6-Month Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Spending Trend</CardTitle>
            <CardDescription>Monthly expenses over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="amount" stroke="#ef4444" strokeWidth={2} name="Spent" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No trend data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Debt Overview */}
        {debtData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Debt Overview</CardTitle>
              <CardDescription>Summary of what you owe and what is owed to you</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={debtData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {debtData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Goal Progress */}
        {goalData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Goal Progress</CardTitle>
              <CardDescription>Top active goals by completion status</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart layout="vertical" data={goalData} margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="saved" name="Saved" stackId="a" fill="#10b981" />
                  <Bar dataKey="remaining" name="Remaining" stackId="a" fill="#e5e7eb" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Account Balances */}
        {accountData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Account Balances</CardTitle>
              <CardDescription>Current balance across all accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={accountData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="balance" name="Balance" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Payment Methods Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>How you're paying for expenses</CardDescription>
          </CardHeader>
          <CardContent>
            {paymentMethodData.length > 0 ? (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={paymentMethodData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="value" name="Amount">
                      {paymentMethodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PAYMENT_COLORS[entry.name.toLowerCase() as keyof typeof PAYMENT_COLORS] || "#6b7280"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                {/* Payment Method List */}
                <div className="space-y-2">
                  {paymentMethodData.map((method) => (
                    <div key={method.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: PAYMENT_COLORS[method.name.toLowerCase() as keyof typeof PAYMENT_COLORS] || "#6b7280" }}
                        />
                        <span>{method.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(method.value)}</p>
                        <p className="text-xs text-muted-foreground">{method.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No payment data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
