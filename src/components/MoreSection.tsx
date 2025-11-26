import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import {
  Settings,
  BarChart3,
  HandCoins,
  Users,
  BookOpen,
  LogOut,
  ChevronRight,
  Copy,
  Check,
  Download,
  Trash2,
  Target,
  Plus,
  CircleDollarSign,
  Wallet,
  Languages,
  Tag,
  RefreshCw,
  Shield,
  CreditCard,
  Crown,
  Sparkles
} from "lucide-react";
import { useApp } from "../lib/store";
import { useLanguage, Language } from "../lib/language";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "./ui/alert-dialog";
import { FamilySettings } from "./settings/FamilySettings";
import { CategorySettings } from "./settings/CategorySettings";
import { RecurringTransactionsList } from "./transaction/RecurringTransactionsList";
import { QuickGuide } from "./QuickGuide";
import { DashboardCharts } from "./dashboard/DashboardCharts";
import { DebtList } from "./debt/DebtList";
import { BudgetList } from "./budget/BudgetList";
import { AccountsList } from "./account/AccountsList";
import { AddBudgetDialog } from "./budget/AddBudgetDialog";
import { AddAccountDialog } from "./account/AddAccountDialog";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { GoalList } from "./goal/GoalList";
import { AddGoalDialog } from "./goal/AddGoalDialog";
import { AddDebtDialog } from "./debt/AddDebtDialog";
import { toast } from "sonner";
import { PrivacyPolicy } from "./settings/PrivacyPolicy";
import { cn } from "../lib/utils";

interface MoreSectionProps {
  onViewChange?: (view: string) => void;
  onShowReports?: () => void;
}

export function MoreSection({ onViewChange, onShowReports }: MoreSectionProps) {
  const { currentUser, currentFamily, logout, debts, goals, budgets, accounts, expenses } = useApp();
  const { language, setLanguage, t } = useLanguage();
  const [showDialog, setShowDialog] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddDebt, setShowAddDebt] = useState(false);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  // Count active items
  const activeDebts = debts.filter(d => d.status === "pending");
  const activeGoals = goals.filter(g => g.is_active);
  const activeBudgets = budgets.length;
  const activeAccounts = accounts.length;

  const handleCopyInviteCode = () => {
    if (currentFamily?.invite_code) {
      navigator.clipboard.writeText(currentFamily.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Invite code copied!");
    }
  };

  const handleExportData = () => {
    toast.info("🚀 Coming Soon!", {
      description: "Data export feature is being enhanced and will be available soon!"
    });
  };

  const handleClearData = () => {
    if (confirm("This will clear all app data and reload the page. Continue?")) {
      indexedDB.deleteDatabase("KharchaPalDB");
      localStorage.clear();
      window.location.reload();
    }
  };

  // Quick Action Grid Items
  const quickActions = [
    {
      id: "reports",
      title: t('reports'),
      icon: BarChart3,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      onClick: onShowReports || (() => setShowDialog("reports")),
      description: "Spending insights"
    },
    {
      id: "budgets",
      title: t('budgets'),
      icon: CircleDollarSign,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      onClick: () => setShowDialog("budgets"),
      badge: activeBudgets > 0 ? activeBudgets : undefined,
      description: "Set limits"
    },
    {
      id: "accounts",
      title: t('accounts'),
      icon: Wallet,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
      onClick: () => setShowDialog("accounts"),
      badge: activeAccounts > 0 ? activeAccounts : undefined,
      description: "Manage cards"
    },
    {
      id: "goals",
      title: "Goals",
      icon: Target,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
      onClick: () => setShowDialog("goals"),
      badge: activeGoals.length > 0 ? activeGoals.length : undefined,
      description: "Savings targets"
    },
    {
      id: "ious",
      title: t('debts'),
      icon: HandCoins,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      onClick: () => setShowDialog("ious"),
      badge: activeDebts.length > 0 ? activeDebts.length : undefined,
      description: "Lent & Borrowed"
    },
    {
      id: "subscriptions",
      title: "Subs",
      icon: RefreshCw,
      color: "text-pink-600 dark:text-pink-400",
      bgColor: "bg-pink-100 dark:bg-pink-900/30",
      onClick: () => setShowDialog("subscriptions"),
      description: "Recurring"
    }
  ];

  // List Menu Items
  const menuItems = [
    {
      id: "categories",
      title: "Categories",
      description: "Manage custom categories",
      icon: Tag,
      iconColor: "text-indigo-500",
      onClick: () => setShowDialog("categories"),
    },
    {
      id: "family",
      title: t('family'),
      description: "Invite & manage members",
      icon: Users,
      iconColor: "text-primary",
      onClick: () => setShowDialog("invite"),
      adminOnly: true,
    },
    {
      id: "settings",
      title: t('settings'),
      description: "App preferences",
      icon: Settings,
      iconColor: "text-slate-500",
      onClick: () => setShowDialog("settings"),
    },
    {
      id: "language",
      title: t('language'),
      description: "Change app language",
      icon: Languages,
      iconColor: "text-blue-500",
      badge: language.toUpperCase(),
      onClick: () => setShowDialog("language"),
    },
    {
      id: "guide",
      title: t('guide'),
      description: "How to use KharchaPal",
      icon: BookOpen,
      iconColor: "text-teal-500",
      onClick: () => setShowDialog("guide"),
    },
    {
      id: "about",
      title: t('about'),
      description: "Developer info & support",
      icon: Sparkles,
      iconColor: "text-amber-500",
      onClick: () => setShowDialog("about"),
    },
    {
      id: "privacy",
      title: "Privacy Policy",
      description: "Data handling & security",
      icon: Shield,
      iconColor: "text-green-600",
      onClick: () => setShowPrivacyPolicy(true),
    },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Premium Profile Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 border border-primary/20 shadow-lg">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                {currentUser?.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold">{currentUser?.name}</h2>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Users className="h-3 w-3" />
                  <span>{currentFamily?.name}</span>
                </div>
                {currentUser?.role === "admin" && (
                  <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary border border-primary/30">
                    <Crown className="h-3 w-3" />
                    <span>Admin</span>
                  </div>
                )}
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sign out?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to sign out? You will need to log in again to access your data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={logout}>Sign out</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-card border border-border p-3 shadow-sm">
              <p className="text-xs text-muted-foreground mb-1">Monthly Spend</p>
              <p className="text-lg font-bold text-destructive">
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: currentFamily?.currency || 'INR' }).format(
                  (expenses || [])
                    .filter(e => {
                      const expDate = new Date(e.date);
                      const now = new Date();
                      return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
                    })
                    .reduce((sum, e) => sum + (e.total_amount || 0), 0)
                )}
              </p>
            </div>
            <div className="rounded-xl bg-card border border-border p-3 shadow-sm">
              <p className="text-xs text-muted-foreground mb-1">Active Goals</p>
              <p className="text-lg font-bold text-primary">{activeGoals.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-1 uppercase tracking-wider">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              className="relative flex flex-col items-start p-4 rounded-xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all duration-200 group"
            >
              <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110", action.bgColor, action.color)}>
                <action.icon className="h-5 w-5" />
              </div>
              <span className="font-semibold text-sm">{action.title}</span>
              <span className="text-xs text-muted-foreground mt-0.5">{action.description}</span>
              {action.badge !== undefined && (
                <span className="absolute top-3 right-3 h-5 min-w-[1.25rem] px-1 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                  {action.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Menu List */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-1 uppercase tracking-wider">
          More Options
        </h3>
        <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
          {menuItems.map((item, index) => {
            if (item.adminOnly && currentUser?.role !== "admin") return null;
            const Icon = item.icon;

            return (
              <div key={item.id}>
                <button
                  onClick={item.onClick}
                  className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left"
                >
                  <div className={cn("h-9 w-9 rounded-full flex items-center justify-center bg-muted", item.iconColor)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{item.title}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                </button>
                {index < menuItems.length - 1 && <div className="h-[1px] bg-border/50 mx-4" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Management */}
      <div className="space-y-3 pt-4">
        <Button
          variant="outline"
          className="w-full justify-start gap-3 h-12 rounded-xl border-dashed"
          onClick={handleExportData}
        >
          <Download className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Export Data (CSV/PDF)</span>
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-12 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleClearData}
        >
          <Trash2 className="h-4 w-4" />
          <span>Clear All Data</span>
        </Button>
      </div>

      {/* Version Info */}
      <div className="text-center py-4">
        <p className="text-xs text-muted-foreground">KharchaPal v1.0.0 • Offline-first</p>
      </div>

      {/* Dialogs */}
      <Dialog open={showDialog === "reports"} onOpenChange={() => setShowDialog(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reports & Charts</DialogTitle>
            <DialogDescription>Visualize your spending patterns</DialogDescription>
          </DialogHeader>
          <DashboardCharts />
        </DialogContent>
      </Dialog>

      <Dialog open={showDialog === "budgets"} onOpenChange={() => setShowDialog(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Monthly Budgets</DialogTitle>
                <DialogDescription>Set spending limits</DialogDescription>
              </div>
              <Button size="sm" onClick={() => setShowAddBudget(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>
          </DialogHeader>
          <BudgetList />
        </DialogContent>
      </Dialog>

      <Dialog open={showDialog === "accounts"} onOpenChange={() => setShowDialog(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Bank Accounts</DialogTitle>
                <DialogDescription>Manage payment methods</DialogDescription>
              </div>
              <Button size="sm" onClick={() => setShowAddAccount(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>
          </DialogHeader>
          <AccountsList />
        </DialogContent>
      </Dialog>

      <Dialog open={showDialog === "goals"} onOpenChange={() => setShowDialog(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Savings Goals</DialogTitle>
                <DialogDescription>Track your savings targets</DialogDescription>
              </div>
              <Button size="sm" onClick={() => setShowAddGoal(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>
          </DialogHeader>
          <GoalList />
        </DialogContent>
      </Dialog>

      <Dialog open={showDialog === "ious"} onOpenChange={() => setShowDialog(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Debts & Loans</DialogTitle>
                <DialogDescription>Money lent and borrowed</DialogDescription>
              </div>
              <Button size="sm" onClick={() => setShowAddDebt(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>
          </DialogHeader>
          <DebtList />
        </DialogContent>
      </Dialog>

      <Dialog open={showDialog === "invite"} onOpenChange={() => setShowDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Family Members</DialogTitle>
            <DialogDescription>Share this code to join</DialogDescription>
          </DialogHeader>
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-center text-3xl tracking-widest font-mono select-all">
                {currentFamily?.invite_code}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={handleCopyInviteCode} className="w-full" variant={copied ? "default" : "secondary"}>
                {copied ? <><Check className="h-4 w-4 mr-2" /> Copied!</> : <><Copy className="h-4 w-4 mr-2" /> Copy Code</>}
              </Button>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      <Dialog open={showDialog === "guide"} onOpenChange={() => setShowDialog(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quick Guide</DialogTitle>
          </DialogHeader>
          <QuickGuide />
        </DialogContent>
      </Dialog>

      <Dialog open={showDialog === "about"} onOpenChange={() => setShowDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-3xl text-white shadow-lg">
              ✨
            </div>
            <DialogTitle className="text-2xl">KharchaPal</DialogTitle>
            <DialogDescription>Simple household expense tracker</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-center">
            <div className="bg-muted/50 p-4 rounded-xl border">
              <p className="font-medium text-primary">Developed by Nitesh Jha</p>
              <p className="text-xs text-muted-foreground mt-1">UI/UX Designer & AI Developer</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => window.open('https://www.linkedin.com/in/nitesh-jha-2021/', '_blank')}>
                LinkedIn
              </Button>
              <Button className="flex-1" onClick={() => window.open(`mailto:niteshjha.uiux@yahoo.com?subject=KharchaPal Feedback`, '_blank')}>
                Feedback
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDialog === "settings"} onOpenChange={() => setShowDialog(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Family Settings</DialogTitle>
          </DialogHeader>
          <FamilySettings />
        </DialogContent>
      </Dialog>

      <Dialog open={showDialog === "categories"} onOpenChange={() => setShowDialog(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Categories</DialogTitle>
          </DialogHeader>
          <CategorySettings />
        </DialogContent>
      </Dialog>

      <Dialog open={showDialog === "subscriptions"} onOpenChange={() => setShowDialog(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <RecurringTransactionsList />
        </DialogContent>
      </Dialog>

      <Dialog open={showDialog === "language"} onOpenChange={() => setShowDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('select_language')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            {[
              { code: 'en', name: 'English', native: 'English' },
              { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
              { code: 'mr', name: 'Marathi', native: 'मराठी' },
              { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
              { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
            ].map((lang) => (
              <Button
                key={lang.code}
                variant={language === lang.code ? "default" : "outline"}
                className="justify-between h-12"
                onClick={() => {
                  setLanguage(lang.code as Language);
                  setShowDialog(null);
                }}
              >
                <span>{lang.name}</span>
                <span className="text-xs opacity-70">{lang.native}</span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <AddBudgetDialog open={showAddBudget} onClose={() => setShowAddBudget(false)} />
      <AddAccountDialog open={showAddAccount} onClose={() => setShowAddAccount(false)} />
      <AddGoalDialog open={showAddGoal} onClose={() => setShowAddGoal(false)} />
      <AddDebtDialog open={showAddDebt} onClose={() => setShowAddDebt(false)} />
      <PrivacyPolicy open={showPrivacyPolicy} onClose={() => setShowPrivacyPolicy(false)} />
    </div>
  );
}
