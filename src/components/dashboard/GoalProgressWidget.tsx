import { useApp } from "../../lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { Button } from "../ui/button";
import { Target, ChevronRight, Plus } from "lucide-react";
import { formatCurrency } from "../../lib/utils";
import { AddGoalTransferDialog } from "../goal/AddGoalTransferDialog";
import { useState } from "react";

export function GoalProgressWidget() {
    const { goals } = useApp();
    const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

    // Find the active goal with the highest priority (closest to completion or just the first one)
    const activeGoal = goals.find(g => g.is_active && g.priority === 'high') || goals.find(g => g.is_active);

    if (!activeGoal) return null;

    const progress = (activeGoal.current_amount / activeGoal.target_amount) * 100;
    const remaining = activeGoal.target_amount - activeGoal.current_amount;

    return (
        <>
            <Card
                className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-100 dark:border-blue-900 cursor-pointer hover:shadow-md transition-all"
                onClick={() => setSelectedGoalId(activeGoal.id)}
            >
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100 flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Goal of the Month
                        </CardTitle>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                            <ChevronRight className="h-4 w-4 text-blue-900 dark:text-blue-100" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex justify-between items-end">
                            <div>
                                <h3 className="font-semibold text-lg">{activeGoal.goal_name}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {formatCurrency(activeGoal.current_amount)} / {formatCurrency(activeGoal.target_amount)}
                                </p>
                            </div>
                            <Button
                                size="sm"
                                className="h-8 bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedGoalId(activeGoal.id);
                                }}
                            >
                                <Plus className="h-3 w-3 mr-1" />
                                Add
                            </Button>
                        </div>

                        <div className="space-y-1">
                            <Progress value={progress} className="h-2 bg-blue-200 dark:bg-blue-900" indicatorClassName="bg-blue-600" />
                            <p className="text-xs text-right text-blue-700 dark:text-blue-300">
                                {progress.toFixed(0)}% • {formatCurrency(remaining)} to go
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {selectedGoalId && (
                <AddGoalTransferDialog
                    goal={activeGoal}
                    open={!!selectedGoalId}
                    onClose={() => setSelectedGoalId(null)}
                />
            )}
        </>
    );
}
