import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { useApp } from "../../lib/store";
import { formatCurrency } from "../../lib/utils";
import { Goal } from "../../types";
import { GoalDetailSheet } from "./GoalDetailSheet";
import { Target, Plus } from "lucide-react";

export function GoalList() {
  const { currentUser, goals } = useApp();
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  // Filter goals based on user role
  const visibleGoals = currentUser?.role === "admin"
    ? goals
    : goals.filter((g) => g.is_shared || g.created_by === currentUser?.id);

  const activeGoals = visibleGoals.filter((g) => g.is_active);
  const completedGoals = visibleGoals.filter((g) => !g.is_active && g.completed_at);

  const getProgressPercentage = (goal: Goal) => {
    return Math.min((goal.current_amount / goal.target_amount) * 100, 100);
  };

  const getDaysRemaining = (goal: Goal) => {
    if (!goal.target_date) return null;
    const today = new Date();
    const target = new Date(goal.target_date);
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300";
      case "low": return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300";
    }
  };

  if (visibleGoals.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center p-6 rounded-full bg-primary-container/30 mb-4">
          <Target className="h-12 w-12 text-primary" />
        </div>
        <p className="text-muted-foreground text-lg mb-2">No goals yet</p>
        <p className="text-sm text-muted-foreground">
          Create your first savings goal to get started
        </p>
      </div>
    );
  }

  const renderGoalCard = (goal: Goal) => {
    const progress = getProgressPercentage(goal);
    const daysRemaining = getDaysRemaining(goal);
    const isCompleted = progress >= 100;

    return (
      <Card
        key={goal.id}
        className="p-4 elevation-1 hover:elevation-3 cursor-pointer transition-all duration-200 bg-card hover:bg-surface-variant/30 border-outline-variant/20"
        onClick={() => setSelectedGoal(goal)}
      >
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="text-3xl p-2 rounded-xl bg-primary-container/30 shrink-0">
                {goal.goal_icon || "🎯"}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="truncate font-medium">{goal.goal_name}</h4>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge variant="outline" className={getPriorityColor(goal.priority)}>
                    {goal.priority}
                  </Badge>
                  {isCompleted && (
                    <Badge className="bg-success text-white">
                      ✓ Completed
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm text-muted-foreground">Target</p>
              <p className="font-semibold">{formatCurrency(goal.target_amount)}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress.toFixed(1)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Saved: {formatCurrency(goal.current_amount)}
              </span>
              <span className="text-muted-foreground">
                Remaining: {formatCurrency(goal.target_amount - goal.current_amount)}
              </span>
            </div>
          </div>

          {/* Footer */}
          {daysRemaining !== null && (
            <div className="text-sm text-muted-foreground">
              {daysRemaining > 0 ? (
                <span>⏰ {daysRemaining} days remaining</span>
              ) : daysRemaining === 0 ? (
                <span className="text-orange-600">⏰ Due today!</span>
              ) : (
                <span className="text-red-600">⏰ {Math.abs(daysRemaining)} days overdue</span>
              )}
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <>
      <div className="space-y-6">
        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm text-muted-foreground uppercase tracking-wide px-1">
              Active Goals ({activeGoals.length})
            </h3>
            {activeGoals.map(renderGoalCard)}
          </div>
        )}

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm text-muted-foreground uppercase tracking-wide px-1">
              Completed Goals ({completedGoals.length})
            </h3>
            {completedGoals.map(renderGoalCard)}
          </div>
        )}
      </div>

      {selectedGoal && (
        <GoalDetailSheet
          goal={selectedGoal}
          open={!!selectedGoal}
          onClose={() => setSelectedGoal(null)}
        />
      )}
    </>
  );
}
