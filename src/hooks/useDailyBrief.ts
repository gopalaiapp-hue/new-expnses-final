import { useEffect } from 'react';
import { useApp } from '../lib/store';
import { toast } from 'sonner';

export function useDailyBrief() {
    const { expenses, income, debts, currentUser, currentFamily } = useApp();

    useEffect(() => {
        const checkDailyBrief = () => {
            if (!currentUser || !currentFamily) return;

            const settings = localStorage.getItem('notificationSettings');
            if (!settings) return;

            const { dailyBriefEnabled, dailyBriefTime, showExpenses, showIncome, showDebts } = JSON.parse(settings);
            if (!dailyBriefEnabled) return;

            const now = new Date();
            const [hours, minutes] = dailyBriefTime.split(':').map(Number);

            if (now.getHours() === hours && now.getMinutes() === minutes) {
                const today = new Date().toDateString();
                const lastShown = localStorage.getItem('lastDailyBrief');

                if (lastShown === today) return;

                const parts = [];

                if (showExpenses) {
                    const todayExpenses = expenses.filter((e: any) =>
                        new Date(e.date).toDateString() === today
                    );
                    const totalExpense = todayExpenses.reduce((sum: number, e: any) => sum + e.total_amount, 0);
                    parts.push(`${currentFamily.currency}${totalExpense.toFixed(2)} spent`);
                }

                if (showIncome) {
                    const todayIncome = income.filter((i: any) =>
                        new Date(i.date).toDateString() === today
                    );
                    const totalIncome = todayIncome.reduce((sum: number, i: any) => sum + i.amount, 0);
                    parts.push(`${currentFamily.currency}${totalIncome.toFixed(2)} earned`);
                }

                if (showDebts) {
                    const todayDebts = debts.filter((d: any) =>
                        new Date(d.created_at).toDateString() === today
                    );
                    if (todayDebts.length > 0) {
                        parts.push(`${todayDebts.length} new debts`);
                    }
                }

                if (parts.length > 0) {
                    toast.info(`Daily Brief`, {
                        description: `Today: ${parts.join(', ')}`,
                        duration: 10000,
                    });
                }

                localStorage.setItem('lastDailyBrief', today);
            }
        };

        const interval = setInterval(checkDailyBrief, 60000);
        checkDailyBrief();

        return () => clearInterval(interval);
    }, [expenses, income, debts, currentUser, currentFamily]);
}
