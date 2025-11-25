import { useEffect } from "react";
import { useApp } from "../lib/store";
import { toast } from "sonner";
import { format, addDays, isSameDay, parseISO } from "date-fns";

export function NotificationManager() {
    const { recurringTransactions, expenses, income, debts, currentUser } = useApp();

    useEffect(() => {
        if (!currentUser) return;

        const checkNotifications = () => {
            const now = new Date();
            const lastChecked = localStorage.getItem("lastNotificationCheck");
            const lastBrief = localStorage.getItem("lastDailyBrief");

            // Check Recurring Transactions (Due Tomorrow)
            // Only check once per day
            if (!lastChecked || !isSameDay(parseISO(lastChecked), now)) {
                const tomorrow = addDays(now, 1);

                recurringTransactions.forEach(t => {
                    if (!t.is_active) return;
                    const dueDate = parseISO(t.next_due_date);

                    if (isSameDay(dueDate, tomorrow)) {
                        toast.info(`Upcoming Payment: ${t.description}`, {
                            description: `${t.currency} ${t.amount} is due tomorrow!`,
                            duration: 8000,
                        });
                    }
                });

                localStorage.setItem("lastNotificationCheck", now.toISOString());
            }

            // Daily Brief
            // Show if not shown today and time is after 9 AM (default)
            // We can make this configurable later
            if ((!lastBrief || !isSameDay(parseISO(lastBrief), now)) && now.getHours() >= 9) {
                // Calculate yesterday's summary
                const yesterday = addDays(now, -1);
                const yesterdayExpenses = expenses
                    .filter(e => isSameDay(parseISO(e.date), yesterday))
                    .reduce((sum, e) => sum + e.total_amount, 0);

                const yesterdayIncome = income
                    .filter(i => isSameDay(parseISO(i.date), yesterday))
                    .reduce((sum, i) => sum + i.amount, 0);

                if (yesterdayExpenses > 0 || yesterdayIncome > 0) {
                    toast.message("Daily Brief 📅", {
                        description: `Yesterday: Spent ₹${yesterdayExpenses}, Earned ₹${yesterdayIncome}`,
                        duration: 8000,
                    });
                }

                localStorage.setItem("lastDailyBrief", now.toISOString());
            }
        };

        // Check immediately on mount
        checkNotifications();

        // Check every minute
        const interval = setInterval(checkNotifications, 60000);
        return () => clearInterval(interval);

    }, [recurringTransactions, expenses, income, debts, currentUser]);

    return null; // This component doesn't render anything
}
