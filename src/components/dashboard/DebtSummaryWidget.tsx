import { useMemo } from "react";
import { Card, CardContent } from "../ui/card";
import { useApp } from "../../lib/store";
import { useLanguage } from "../../lib/language";
import { ArrowUpRight, ArrowDownLeft, HandCoins } from "lucide-react";

export function DebtSummaryWidget() {
    const { debts, currentUser } = useApp();
    const { t } = useLanguage();

    const debtStats = useMemo(() => {
        if (!currentUser) return null;

        const openDebts = debts.filter(d => d.status === "open");

        if (openDebts.length === 0) return null;

        const youOwe = openDebts
            .filter(d => d.borrower_user_id === currentUser.id)
            .reduce((sum, d) => sum + d.amount, 0);

        const owedToYou = openDebts
            .filter(d => d.lender_user_id === currentUser.id)
            .reduce((sum, d) => sum + d.amount, 0);

        if (youOwe === 0 && owedToYou === 0) return null;

        return { youOwe, owedToYou };
    }, [debts, currentUser]);

    if (!debtStats) return null;

    return (
        <div className="grid grid-cols-2 gap-3">
            {/* You Owe */}
            {debtStats.youOwe > 0 && (
                <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
                    <CardContent className="p-4 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300 mb-1">
                            <div className="p-1.5 bg-orange-100 dark:bg-orange-900/40 rounded-full">
                                <ArrowUpRight className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-xs font-medium uppercase tracking-wide">{t('you_owe')}</span>
                        </div>
                        <span className="text-xl font-bold text-orange-900 dark:text-orange-100">
                            ₹{debtStats.youOwe.toLocaleString('en-IN')}
                        </span>
                    </CardContent>
                </Card>
            )}

            {/* Owed to You */}
            {debtStats.owedToYou > 0 && (
                <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                    <CardContent className="p-4 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-1">
                            <div className="p-1.5 bg-green-100 dark:bg-green-900/40 rounded-full">
                                <ArrowDownLeft className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-xs font-medium uppercase tracking-wide">{t('owed_to_you')}</span>
                        </div>
                        <span className="text-xl font-bold text-green-900 dark:text-green-100">
                            ₹{debtStats.owedToYou.toLocaleString('en-IN')}
                        </span>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
