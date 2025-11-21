import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "../ui/sheet";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { 
  Target, 
  Calendar, 
  User, 
  TrendingUp, 
  Plus,
  CheckCircle2,
  ArrowUpCircle
} from "lucide-react";
import { Goal } from "../../types";
import { useApp } from "../../lib/store";
import { formatCurrency, formatDate } from "../../lib/utils";
import { AddGoalTransferDialog } from "./AddGoalTransferDialog";

interface GoalDetailSheetProps {
  goal: Goal | null;
  open: boolean;
  onClose: () => void;
}

export function GoalDetailSheet({ goal, open, onClose }: GoalDetailSheetProps) {
  const { users, goalTransfers, currentUser } = useApp();
  const [showAddTransfer, setShowAddTransfer] = useState(false);

  if (!goal) return null;

  const creator = users.find((u) => u.id === goal.created_by);
  const transfers = goalTransfers.filter((t) => t.goal_id === goal.id);
  const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
  const isCompleted = progress >= 100;

  const getDaysRemaining = () => {
    if (!goal.target_date) return null;
    const today = new Date();
    const target = new Date(goal.target_date);
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysRemaining = getDaysRemaining();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600";
      case "medium": return "text-yellow-600";
      case "low": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  const getMilestones = () => {
    const milestones = [
      { percentage: 25, label: "25%", achieved: progress >= 25 },
      { percentage: 50, label: "50%", achieved: progress >= 50 },
      { percentage: 75, label: "75%", achieved: progress >= 75 },
      { percentage: 100, label: "100%", achieved: progress >= 100 },
    ];
    return milestones;
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
          <SheetHeader className="mb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">{goal.goal_icon || "🎯"}</span>
                  <div>
                    <SheetTitle className="text-2xl">{goal.goal_name}</SheetTitle>
                    <SheetDescription className="text-base mt-1">
                      Target: {formatCurrency(goal.target_amount)}
                    </SheetDescription>
                  </div>
                </div>
              </div>
              <Badge 
                variant="outline" 
                className={`${getPriorityColor(goal.priority)} border-current`}
              >
                {goal.priority} priority
              </Badge>
            </div>
          </SheetHeader>

          <div className="space-y-6">
            {/* Progress Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Progress
                </h3>
                <span className="text-2xl font-semibold">{progress.toFixed(1)}%</span>
              </div>
              
              <Progress value={progress} className="h-3" />
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                  <p className="text-xs text-muted-foreground mb-1">Saved</p>
                  <p className="font-semibold text-success">
                    {formatCurrency(goal.current_amount)}
                  </p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Remaining</p>
                  <p className="font-semibold">
                    {formatCurrency(goal.target_amount - goal.current_amount)}
                  </p>
                </div>
              </div>

              {isCompleted && (
                <div className="p-4 bg-success/10 border-2 border-success/30 rounded-lg">
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Goal Completed! 🎉</span>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Milestones */}
            <div className="space-y-3">
              <h3>Milestones</h3>
              <div className="grid grid-cols-4 gap-2">
                {getMilestones().map((milestone) => (
                  <div
                    key={milestone.percentage}
                    className={`p-3 rounded-lg text-center transition-all ${
                      milestone.achieved
                        ? "bg-success/20 border-2 border-success/50"
                        : "bg-muted/30 border border-muted"
                    }`}
                  >
                    {milestone.achieved && (
                      <CheckCircle2 className="h-4 w-4 mx-auto mb-1 text-success" />
                    )}
                    <p className="text-sm font-medium">{milestone.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Details */}
            <div className="space-y-3">
              <h3>Details</h3>
              
              {goal.target_date && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <span className="text-sm">Target Date: {formatDate(new Date(goal.target_date))}</span>
                    {daysRemaining !== null && (
                      <p className="text-xs text-muted-foreground">
                        {daysRemaining > 0
                          ? `${daysRemaining} days remaining`
                          : daysRemaining === 0
                          ? "Due today!"
                          : `${Math.abs(daysRemaining)} days overdue`}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Created by {creator?.name || "Unknown"}</span>
              </div>

              {goal.description && (
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">{goal.description}</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Contributions/Transfers */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3>Contributions ({transfers.length})</h3>
                {!isCompleted && (
                  <Button
                    size="sm"
                    onClick={() => setShowAddTransfer(true)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Money
                  </Button>
                )}
              </div>

              {transfers.length === 0 ? (
                <div className="text-center py-8">
                  <ArrowUpCircle className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No contributions yet</p>
                  <p className="text-xs text-muted-foreground">
                    Start saving towards this goal
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {transfers
                    .sort((a, b) => new Date(b.transfer_date).getTime() - new Date(a.transfer_date).getTime())
                    .map((transfer) => {
                      const contributor = users.find((u) => u.id === transfer.contributed_by);
                      return (
                        <div
                          key={transfer.id}
                          className="p-3 bg-muted/30 rounded-lg flex items-center justify-between"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {contributor?.name || "Unknown"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(new Date(transfer.transfer_date))}
                              {transfer.notes && ` • ${transfer.notes}`}
                            </p>
                          </div>
                          <p className="font-semibold text-success">
                            +{formatCurrency(transfer.amount)}
                          </p>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {showAddTransfer && (
        <AddGoalTransferDialog
          goal={goal}
          open={showAddTransfer}
          onClose={() => setShowAddTransfer(false)}
        />
      )}
    </>
  );
}
