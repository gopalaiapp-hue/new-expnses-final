import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Slider } from "../ui/slider";
import { CalendarIcon, Target, Users, Shield } from "lucide-react";
import { useApp } from "../../lib/store";
import { Goal, GoalType, GoalPriority } from "../../types";
import { generateId, formatDate, formatCurrency } from "../../lib/utils";
import { toast } from "sonner@2.0.3";
import { Switch } from "../ui/switch";
import { Badge } from "../ui/badge";

interface AddGoalDialogProps {
  open: boolean;
  onClose: () => void;
}

// Common goal templates for Indian families
const COMMON_GOALS = [
  { type: "vehicle_purchase", label: "Two Wheeler", icon: "🏍️", suggestedAmount: 80000 },
  { type: "vehicle_purchase", label: "Car Purchase", icon: "🚗", suggestedAmount: 600000 },
  { type: "housing", label: "Home Down Payment", icon: "🏠", suggestedAmount: 500000 },
  { type: "travel", label: "Dream Vacation", icon: "✈️", suggestedAmount: 100000 },
  { type: "wedding", label: "Wedding Fund", icon: "💍", suggestedAmount: 500000 },
  { type: "emergency_fund", label: "Emergency Fund", icon: "🚨", suggestedAmount: 100000 },
  { type: "education", label: "Higher Education", icon: "🎓", suggestedAmount: 300000 },
  { type: "electronics", label: "New Phone/Laptop", icon: "📱", suggestedAmount: 50000 },
  { type: "festival", label: "Festival Shopping", icon: "🎉", suggestedAmount: 25000 },
  { type: "business", label: "Start Business", icon: "💼", suggestedAmount: 200000 },
];

const PRIORITY_OPTIONS = [
  { value: "high", label: "High Priority", color: "text-red-600" },
  { value: "medium", label: "Medium Priority", color: "text-yellow-600" },
  { value: "low", label: "Low Priority", color: "text-green-600" },
];

export function AddGoalDialog({ open, onClose }: AddGoalDialogProps) {
  const { currentUser, currentFamily, addGoal, accounts } = useApp();
  const [step, setStep] = useState<"select" | "custom">("select");
  const [selectedTemplate, setSelectedTemplate] = useState<typeof COMMON_GOALS[0] | null>(null);

  const [goalName, setGoalName] = useState("");
  const [goalType, setGoalType] = useState<GoalType>("other");
  const [goalIcon, setGoalIcon] = useState("🎯");
  const [targetAmount, setTargetAmount] = useState(50000);
  const [monthlyContribution, setMonthlyContribution] = useState(5000);
  const [targetDate, setTargetDate] = useState<Date | undefined>(undefined);
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<GoalPriority>("medium");
  const [isShared, setIsShared] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate estimated months to reach goal
  const estimatedMonths = monthlyContribution > 0
    ? Math.ceil(targetAmount / monthlyContribution)
    : 0;

  const handleTemplateSelect = (template: typeof COMMON_GOALS[0]) => {
    setSelectedTemplate(template);
    setGoalName(template.label);
    setGoalType(template.type as GoalType);
    setGoalIcon(template.icon);
    setTargetAmount(template.suggestedAmount);
    setMonthlyContribution(Math.round(template.suggestedAmount / 10)); // 10 months default
    setStep("custom");
  };

  const handleCustomGoal = () => {
    setSelectedTemplate(null);
    setGoalName("");
    setGoalType("other");
    setGoalIcon("🎯");
    setTargetAmount(50000);
    setMonthlyContribution(5000);
    setStep("custom");
  };

  const handleSubmit = async () => {
    if (!currentUser || !currentFamily) return;

    if (!goalName.trim()) {
      toast.error("Please enter a goal name");
      return;
    }

    if (targetAmount <= 0) {
      toast.error("Please enter a valid target amount");
      return;
    }

    setIsSubmitting(true);
    try {
      const goal: Goal = {
        id: generateId(),
        family_id: currentFamily.id,
        created_by: currentUser.id,
        goal_name: goalName.trim(),
        goal_type: goalType,
        target_amount: targetAmount,
        current_amount: 0,
        target_date: targetDate?.toISOString(),
        description: description.trim() || undefined,
        goal_icon: goalIcon,
        priority,
        is_shared: isShared,
        is_active: true,
        created_at: new Date().toISOString(),
        sync_status: "pending",
        monthly_contribution: monthlyContribution,
        linked_account_id: selectedAccount || undefined,
      };

      await addGoal(goal);
      toast.success(`Goal "${goalName}" created successfully!`);
      handleClose();
    } catch (error) {
      console.error("Failed to add goal:", error);
      toast.error("Failed to create goal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep("select");
    setSelectedTemplate(null);
    setGoalName("");
    setGoalType("other");
    setGoalIcon("🎯");
    setTargetAmount(50000);
    setMonthlyContribution(5000);
    setTargetDate(undefined);
    setDescription("");
    setPriority("medium");
    setIsShared(true);
    setSelectedAccount("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {step === "select" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Choose Your Goal
              </DialogTitle>
              <DialogDescription>
                Select a common goal or create your own custom goal
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Common Goals Grid */}
              <div>
                <h3 className="font-medium mb-3">Common Goals</h3>
                <div className="grid grid-cols-2 gap-3">
                  {COMMON_GOALS.map((template, index) => (
                    <button
                      key={index}
                      onClick={() => handleTemplateSelect(template)}
                      className="flex flex-col items-start gap-2 p-4 rounded-xl border-2 border-border hover:border-primary hover:bg-primary-container/20 transition-all text-left group"
                    >
                      <div className="text-3xl">{template.icon}</div>
                      <div className="flex-1">
                        <div className="font-medium group-hover:text-primary transition-colors">
                          {template.label}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ₹{formatCurrency(template.suggestedAmount)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Goal Button */}
              <Button
                onClick={handleCustomGoal}
                variant="outline"
                className="w-full h-auto py-4 border-2 border-dashed hover:border-primary hover:bg-primary-container/20"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">➕</div>
                  <div className="text-left">
                    <div className="font-medium">Custom Goal</div>
                    <div className="text-sm text-muted-foreground">Create your own savings goal</div>
                  </div>
                </div>
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep("select")}
                  className="mr-2"
                >
                  ← Back
                </Button>
                <div className="flex-1">
                  <DialogTitle>
                    {selectedTemplate ? `Setup ${selectedTemplate.label}` : "Create Custom Goal"}
                  </DialogTitle>
                  <DialogDescription>
                    Configure your savings goal details
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-5">
              {/* Goal Name */}
              <div className="space-y-2">
                <Label htmlFor="goalName">Goal Name *</Label>
                <Input
                  id="goalName"
                  placeholder="e.g., Dream Vacation to Goa"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="h-11"
                />
              </div>

              {/* Goal Category */}
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={goalType} onValueChange={(v) => setGoalType(v as GoalType)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vehicle_purchase">🚗 Vehicle</SelectItem>
                    <SelectItem value="housing">🏠 Housing</SelectItem>
                    <SelectItem value="travel">✈️ Travel</SelectItem>
                    <SelectItem value="wedding">💍 Wedding</SelectItem>
                    <SelectItem value="emergency_fund">🚨 Emergency Fund</SelectItem>
                    <SelectItem value="education">🎓 Education</SelectItem>
                    <SelectItem value="electronics">📱 Electronics</SelectItem>
                    <SelectItem value="festival">🎉 Festival</SelectItem>
                    <SelectItem value="business">💼 Business</SelectItem>
                    <SelectItem value="other">🎯 Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Target Amount with Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Target Amount *</Label>
                  <span className="text-xl font-semibold text-primary">
                    ₹{formatCurrency(targetAmount)}
                  </span>
                </div>
                <Slider
                  value={[targetAmount]}
                  onValueChange={([value]) => {
                    setTargetAmount(value);
                    setMonthlyContribution(Math.round(value / 10));
                  }}
                  min={1000}
                  max={5000000}
                  step={1000}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>₹1k</span>
                  <span>₹50L</span>
                </div>
              </div>

              {/* Monthly Contribution */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Monthly Contribution</Label>
                  <span className="text-lg font-semibold text-green-600">
                    ₹{formatCurrency(monthlyContribution)}/mo
                  </span>
                </div>
                <Slider
                  value={[monthlyContribution]}
                  onValueChange={([value]) => setMonthlyContribution(value)}
                  min={500}
                  max={Math.min(targetAmount, 100000)}
                  step={500}
                  className="w-full"
                />
                {estimatedMonths > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{estimatedMonths} months to reach goal</span>
                  </div>
                )}
              </div>

              {/* Bank Account Selection */}
              {accounts.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="account">Savings Account (Optional)</Label>
                  <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                    <SelectTrigger id="account" className="h-11">
                      <SelectValue placeholder="Select account for this goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No specific account</SelectItem>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.account_name} - {account.account_type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Target Date */}
              <div className="space-y-2">
                <Label>Target Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-11 justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {targetDate ? formatDate(targetDate) : "Pick a target date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={targetDate}
                      onSelect={setTargetDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label>Priority</Label>
                <div className="grid grid-cols-3 gap-2">
                  {PRIORITY_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      variant={priority === option.value ? "default" : "outline"}
                      onClick={() => setPriority(option.value as GoalPriority)}
                      className="h-11"
                    >
                      {option.label.split(" ")[0]}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add notes about this goal..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>

              {/* Shared Goal */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-purple-600" />
                  <div>
                    <div className="font-medium">Shared Goal</div>
                    <div className="text-sm text-muted-foreground">
                      Family members can contribute together
                    </div>
                  </div>
                </div>
                <Switch checked={isShared} onCheckedChange={setIsShared} />
              </div>

              {/* Goal Summary */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-4 rounded-xl border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-3xl">{goalIcon}</div>
                  <div className="flex-1">
                    <div className="font-semibold">{goalName || "Your Goal"}</div>
                    <div className="text-sm text-muted-foreground">
                      {isShared ? "Shared with family" : "Personal goal"}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Target</div>
                    <div className="font-semibold">₹{formatCurrency(targetAmount)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Monthly</div>
                    <div className="font-semibold">₹{formatCurrency(monthlyContribution)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Timeline</div>
                    <div className="font-semibold">{estimatedMonths} months</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !goalName.trim()}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isSubmitting ? (
                  <>
                    <Target className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Target className="mr-2 h-4 w-4" />
                    Create Goal
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
