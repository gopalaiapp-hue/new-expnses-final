import { useEffect } from 'react';
import { useApp } from '../lib/store';
import { addDays, isSameDay, isAfter, parseISO, format } from 'date-fns';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { Expense } from '../types';

export function useRecurringTransactionProcessor() {
    const { recurringTransactions, addExpense, updateRecurringTransaction, currentUser } = useApp();

    useEffect(() => {
        if (!currentUser) return;

        const processTransactions = async () => {
            const today = new Date();
            const tomorrow = addDays(today, 1);

            for (const transaction of recurringTransactions) {
                if (!transaction.is_active) continue;

                const nextDueDate = parseISO(transaction.next_due_date);

                // Check for Auto-deduct (Due today or past due)
                if (transaction.auto_deduct && (isSameDay(today, nextDueDate) || isAfter(today, nextDueDate))) {
                    // Create Expense
                    const newExpense: Expense = {
                        id: uuidv4(),
                        family_id: transaction.family_id,
                        total_amount: transaction.amount,
                        currency: transaction.currency,
                        category: transaction.category,
                        notes: transaction.description, // Mapping description to notes
                        date: transaction.next_due_date, // Use the due date as expense date
                        payment_lines: [{
                            id: uuidv4(),
                            method: 'cash', // Default to cash
                            amount: transaction.amount,
                            payer_user_id: transaction.created_by,
                        }],
                        attachments: [],
                        is_shared: true,
                        sync_status: 'pending',
                        created_by: transaction.created_by,
                        created_at: new Date().toISOString(),
                    };

                    await addExpense(newExpense);

                    // Calculate next due date
                    let newNextDueDate = nextDueDate;
                    switch (transaction.frequency) {
                        case 'daily': newNextDueDate = addDays(nextDueDate, 1); break;
                        case 'weekly': newNextDueDate = addDays(nextDueDate, 7); break;
                        case 'monthly': newNextDueDate = addDays(nextDueDate, 30); break; // Approximation
                        case 'yearly': newNextDueDate = addDays(nextDueDate, 365); break; // Approximation
                    }

                    // Update Transaction
                    await updateRecurringTransaction({
                        ...transaction,
                        next_due_date: format(newNextDueDate, 'yyyy-MM-dd'),
                    });

                    toast.success(`Auto-deducted ${transaction.currency} ${transaction.amount} for ${transaction.description}`);
                }

                // Check for Notifications
                if (transaction.notify) {
                    // Due Tomorrow
                    if (isSameDay(tomorrow, nextDueDate)) {
                        toast.info(`Reminder: ${transaction.description} is due tomorrow!`);
                    }
                    // Due Today (and not auto-deducted)
                    else if (isSameDay(today, nextDueDate) && !transaction.auto_deduct) {
                        toast.warning(`Reminder: ${transaction.description} is due today!`);
                    }
                }
            }
        };

        processTransactions();
    }, [recurringTransactions, currentUser, addExpense, updateRecurringTransaction]);
}
