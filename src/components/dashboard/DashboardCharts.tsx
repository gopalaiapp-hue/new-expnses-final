import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useApp } from "../../lib/store";
import { formatCurrency } from "../../lib/utils";
import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";

const COLORS = ["#8b5cf6", "#f97316", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];

export function DashboardCharts() {
  const { currentUser, currentFamily, expenses, users } = useApp();

  const { categoryData, memberData, paymentMethodData } = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Filter expenses for current month
    const monthExpenses = expenses.filter(
      (e) => new Date(e.date) >= startOfMonth &&
      (currentUser?.role === "admin" || e.is_shared || e.created_by === currentUser?.id)
    );

    // Category breakdown
    const categoryTotals: Record<string, number> = {};
    monthExpenses.forEach((expense) => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.total_amount;
    });

    const categoryData = Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Member breakdown (admin only)
    const memberTotals: Record<string, number> = {};
    if (currentUser?.role === "admin") {
      monthExpenses.forEach((expense) => {
        memberTotals[expense.created_by] = (memberTotals[expense.created_by] || 0) + expense.total_amount;
      });
    }

    const memberData = Object.entries(memberTotals)
      .map(([userId, value]) => ({
        name: users.find((u) => u.id === userId)?.name || "Unknown",
        value,
      }))
      .sort((a, b) => b.value - a.value);

    // Payment method breakdown
    const methodTotals: Record<string, number> = {};
    monthExpenses.forEach((expense) => {
      expense.payment_lines.forEach((line) => {
        methodTotals[line.method] = (methodTotals[line.method] || 0) + line.amount;
      });
    });

    const paymentMethodData = Object.entries(methodTotals)
      .map(([name, value]) => ({ 
        name: name.charAt(0).toUpperCase() + name.slice(1), 
        value 
      }))
      .sort((a, b) => b.value - a.value);

    return { categoryData, memberData, paymentMethodData };
  }, [expenses, currentUser, users]);

  if (categoryData.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Top Categories</CardTitle>
          <CardDescription>This month's spending by category</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value as number, currentFamily?.currency)} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      {paymentMethodData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>How you're paying</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={paymentMethodData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number, currentFamily?.currency)} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Member Breakdown (Admin only) */}
      {currentUser?.role === "admin" && memberData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Member Spending</CardTitle>
            <CardDescription>Expenses by family member</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={memberData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number, currentFamily?.currency)} />
                <Bar dataKey="value" fill="#f97316" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
