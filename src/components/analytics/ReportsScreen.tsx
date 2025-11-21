import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ArrowLeft, TrendingUp, TrendingDown, Receipt, PieChart as PieChartIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useApp } from "../../lib/store";
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
  const { expenses } = useApp();

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const transactionCount = expenses.length;
    const averageTransaction = transactionCount > 0 ? totalSpent / transactionCount : 0;

    // Get unique categories count
    const categories = new Set(expenses.map(exp => exp.category));

    return {
      totalSpent,
      transactionCount,
      averageTransaction,
      categoriesUsed: categories.size
    };
  }, [expenses]);

  // Category breakdown for pie chart
  const categoryData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};

    expenses.forEach(exp => {
      if (!categoryTotals[exp.category]) {
        categoryTotals[exp.category] = 0;
      }
      categoryTotals[exp.category] += exp.amount;
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
        monthlyData[monthKey] += exp.amount;
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
        const method = line.account_id === "cash" ? "cash" 
                     : line.account_id === "upi" ? "upi"
                     : line.account_id.includes("card") ? "card"
                     : "bank";

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
