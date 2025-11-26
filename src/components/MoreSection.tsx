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
  Shield
} from "lucide-react";
import { useApp } from "../lib/store";
import { useLanguage, Language } from "../lib/language";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
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

interface MoreSectionProps {
  onViewChange?: (view: string) => void;
  onShowReports?: () => void;
}

export function MoreSection({ onViewChange, onShowReports }: MoreSectionProps) {
  const { currentUser, currentFamily, logout, debts, goals, budgets, accounts, expenses, income, goalTransfers, users } = useApp();
  const { language, setLanguage, t } = useLanguage();
  const [showDialog, setShowDialog] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddDebt, setShowAddDebt] = useState(false);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  // Count active items
  const activeDebts = debts.filter(d => d.status === "open");
  const activeGoals = goals.filter(g => g.is_active);
  const activeBudgets = budgets.length;
  const activeAccounts = accounts.length;

  const handleCopyInviteCode = () => {
    toast.info("🚀 Coming Soon!", {
      description: "Invite feature is being enhanced and will be available soon!"
    });
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

  const menuItems = [
    {
      id: "reports",
      title: t('reports'),
      description: "View spending insights",
      icon: BarChart3,
      iconColor: "text-chart-1",
      onClick: onShowReports || (() => setShowDialog("reports")),
    },
    {
      id: "about",
      title: t('about'),
      description: "Developer info & support",
      icon: Users,
      iconColor: "text-tertiary",
      onClick: () => setShowDialog("about"),
    },
    {
      id: "budgets",
      title: t('budgets'),
      description: "Set spending limits",
      icon: CircleDollarSign,
      iconColor: "text-purple-600",
      badge: activeBudgets > 0 ? `${activeBudgets}` : undefined,
      onClick: () => setShowDialog("budgets"),
    },
    {
      id: "accounts",
      title: t('accounts'),
      description: "Manage payment accounts",
      icon: Wallet,
      iconColor: "text-green-600",
      badge: activeAccounts > 0 ? `${activeAccounts}` : undefined,
      onClick: () => setShowDialog("accounts"),
    },
    {
      id: "ious",
      title: t('debts'),
      description: "Money lent and borrowed",
      icon: HandCoins,
      iconColor: "text-orange-600",
      badge: activeDebts.length > 0 ? `${activeDebts.length}` : undefined,
      onClick: () => setShowDialog("ious"),
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
      id: "guide",
      title: t('guide'),
      description: "Learn how to use KharchaPal",
      icon: BookOpen,
      iconColor: "text-tertiary",
      onClick: () => setShowDialog("guide"),
    },
    {
      id: "settings",
      title: t('settings'),
      description: "Family preferences",
      icon: Settings,
      iconColor: "text-on-surface-variant",
      onClick: () => setShowDialog("settings"),
    },
    {
      id: "categories",
      title: "Categories",
      description: "Manage custom categories",
      icon: Tag,
      iconColor: "text-pink-600",
      onClick: () => setShowDialog("categories"),
    },
    {
      id: "subscriptions",
      title: "Subscriptions",
      description: "Manage recurring payments",
      icon: RefreshCw,
      iconColor: "text-purple-600",
      onClick: () => setShowDialog("subscriptions"),
    },
    {
      id: "language",
      title: t('language'),
      description: "Change app language",
      icon: Languages,
      iconColor: "text-blue-600",
      badge: language.toUpperCase(),
      onClick: () => setShowDialog("language"),
    },
    {
      id: "privacy",
      title: "Privacy Policy",
      description: "How we handle your data",
      icon: Shield,
      iconColor: "text-green-600",
      onClick: () => setShowPrivacyPolicy(true),
    },
  ];

  return (
    <div className="space-y-4">
      {/* User Info Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-tertiary/10 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl">
              {currentUser?.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="truncate">{currentUser?.name}</CardTitle>
              <CardDescription className="truncate">
                {currentFamily?.name}
              </CardDescription>
            </div>
            {currentUser?.role === "admin" && (
              <Badge variant="secondary" className="shrink-0">
                Admin
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Menu Items */}
      <div className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          // Skip admin-only items for non-admins
          if (item.adminOnly && currentUser?.role !== "admin") {
            return null;
          }

          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className="w-full bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:bg-accent/50 transition-all duration-200 elevation-1 hover:elevation-2"
            >
              <div className={`h-10 w-10 rounded-lg bg-surface-variant/50 flex items-center justify-center ${item.iconColor}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="truncate">{item.title}</h3>
                  {item.badge && (
                    <Badge variant="secondary" className="shrink-0">
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {item.description}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
            </button>
          );
        })}
      </div>

      {/* App Info */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">App Version</span>
            <span className="text-sm">1.0.0</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Storage</span>
            <span className="text-sm">Local (Offline-first)</span>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start gap-3"
          onClick={handleExportData}
        >
          <Download className="h-4 w-4" />
          Export Data
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start gap-3 text-destructive hover:text-destructive"
          onClick={handleClearData}
        >
          <Trash2 className="h-4 w-4" />
          Clear All Data
        </Button>
      </div>

      {/* Logout */}
      <Button
        variant="destructive"
        className="w-full gap-2"
        onClick={logout}
      >
        <LogOut className="h-4 w-4" />
        Logout
      </Button>

      {/* Dialogs */}
      {/* Reports Dialog */}
      <Dialog open={showDialog === "reports"} onOpenChange={() => setShowDialog(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reports & Charts</DialogTitle>
            <DialogDescription>
              Visualize your spending patterns and trends
            </DialogDescription>
          </DialogHeader>
          <DashboardCharts />
        </DialogContent>
      </Dialog>

      {/* Budgets Dialog */}
      <Dialog open={showDialog === "budgets"} onOpenChange={() => setShowDialog(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Monthly Budgets</DialogTitle>
                <DialogDescription>
                  Set spending limits for different categories
                </DialogDescription>
              </div>
              <Button size="sm" onClick={() => setShowAddBudget(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Budget
              </Button>
            </div>
          </DialogHeader>
          <BudgetList />
        </DialogContent>
      </Dialog>

      {/* Accounts Dialog */}
      <Dialog open={showDialog === "accounts"} onOpenChange={() => setShowDialog(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Bank Accounts</DialogTitle>
                <DialogDescription>
                  Manage your payment methods and accounts
                </DialogDescription>
              </div>
              <Button size="sm" onClick={() => setShowAddAccount(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Account
              </Button>
            </div>
          </DialogHeader>
          <AccountsList />
        </DialogContent>
      </Dialog>

      {/* Debts & Loans Dialog */}
      <Dialog open={showDialog === "ious"} onOpenChange={() => setShowDialog(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Debts & Loans</DialogTitle>
                <DialogDescription>
                  Money you've lent to or borrowed from others
                </DialogDescription>
              </div>
              <Button size="sm" onClick={() => setShowAddDebt(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Record
              </Button>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <HandCoins className="h-4 w-4" />
                How this works
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li><strong>Money Lent:</strong> Money you gave to others (they owe you)</li>
                <li><strong>Money Borrowed:</strong> Money you took from others (you owe them)</li>
                <li>IOUs are created automatically when you mark a payment as "borrowed"</li>
                <li>Click "Settle" to mark the debt as paid</li>
              </ul>
            </div>
            <DebtList />
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Dialog */}
      <Dialog open={showDialog === "invite"} onOpenChange={() => setShowDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Family Members</DialogTitle>
            <DialogDescription>
              Share this code with family members to join
            </DialogDescription>
          </DialogHeader>
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-3xl tracking-widest font-mono">
                {currentFamily?.invite_code}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={handleCopyInviteCode} className="w-full">
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Invite Code
                  </>
                )}
              </Button>
              <Alert className="mt-4">
                <AlertDescription>
                  New members can enter this code when joining your family
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      {/* Guide Dialog */}
      <Dialog open={showDialog === "guide"} onOpenChange={() => setShowDialog(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quick Guide</DialogTitle>
            <DialogDescription>
              Learn how to use KharchaPal effectively
            </DialogDescription>
          </DialogHeader>
          <QuickGuide />
        </DialogContent>
      </Dialog>

      {/* About App Dialog */}
      <Dialog open={showDialog === "about"} onOpenChange={() => setShowDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-tertiary flex items-center justify-center text-4xl">
              ✨
            </div>
            <DialogTitle className="text-2xl">KharchaPal</DialogTitle>
            <DialogDescription className="text-base">
              Your simple household expense tracker
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-center">
            <div className="bg-gradient-to-r from-primary/10 to-tertiary/10 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-primary mb-2">Developed by</h3>
              <p className="text-xl font-bold text-on-primary-container">Nitesh Jha</p>
              <p className="text-sm text-muted-foreground mt-1">
                I’m Nitesh Jha, a UI/UX Designer who uses AI extensively to plan, design, and develop mobile applications with high speed and clarity. I follow a structured product development approach where every idea begins with a PRD (Product Requirement Document). Using AI tools, I convert the PRD into task lists, flows, wireframes, and development-ready assets, ensuring that the entire process—from concept to a fully functional mobile app—becomes smooth, fast, and extremely efficient.

                My workflow is simple and scalable:

                Create the PRD – Define the problem, goals, features, user journeys, and success metrics.

                Break It Into Tasks Using AI – Convert the PRD into atomic tasks for design, development, and testing.

                Generate User Flows & Wireframes – Use AI models to instantly create low-fidelity and high-fidelity screens.

                Build the App With AI Agents – Transform the design into a working PWA, Android APK, or iOS app using another AI tool.

                Validate & Iterate – Run automated validation flows and refine based on feedback.

                I combine design thinking with AI automation to build apps faster than traditional methods—while still maintaining clarity, structure, and user experience.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  window.open('https://www.linkedin.com/in/nitesh-jha-2021/', '_blank');
                }}
              >
                <Users className="h-4 w-4 mr-2" />
                LinkedIn
              </Button>
              <Button
                onClick={() => {
                  const subject = encodeURIComponent('Feedback: KharchaPal App');
                  const body = encodeURIComponent(`Hi Nitesh,\n\nI wanted to share some feedback about KharchaPal:\n\n[Please share your suggestions, feedback, or any issues you encountered]\n\n- App version: 1.0.0\n- Family: ${currentFamily?.name || 'Not set'}\n\nThank you!`);
                  window.open(`mailto:niteshjha.uiux@yahoo.com subject=${subject}&body=${body}`);
                }}
                className="flex-1"
              >
                💬 Feedback
              </Button>
            </div>

            <div className="text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                If you have time, your suggestions are helpful for improving the app.
              </p>
              <p className="text-xs text-muted-foreground">
                App Version 1.0.0
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showDialog === "settings"} onOpenChange={() => setShowDialog(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Family Settings</DialogTitle>
            <DialogDescription>
              Manage your family preferences and members
            </DialogDescription>
          </DialogHeader>
          <FamilySettings />
        </DialogContent>
      </Dialog>

      {/* Categories Dialog */}
      <Dialog open={showDialog === "categories"} onOpenChange={() => setShowDialog(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Categories</DialogTitle>
            <DialogDescription>
              Add or remove custom categories
            </DialogDescription>
          </DialogHeader>
          <CategorySettings />
        </DialogContent>
      </Dialog>

      {/* Subscriptions Dialog */}
      <Dialog open={showDialog === "subscriptions"} onOpenChange={() => setShowDialog(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <RecurringTransactionsList />
        </DialogContent>
      </Dialog>

      {/* Add Budget Dialog */}
      <AddBudgetDialog open={showAddBudget} onClose={() => setShowAddBudget(false)} />

      {/* Add Account Dialog */}
      <AddAccountDialog open={showAddAccount} onClose={() => setShowAddAccount(false)} />

      {/* Add Goal Dialog */}
      <AddGoalDialog open={showAddGoal} onClose={() => setShowAddGoal(false)} />

      {/* Add Debt Dialog */}
      <AddDebtDialog open={showAddDebt} onClose={() => setShowAddDebt(false)} />

      {/* Language Dialog */}
      <Dialog open={showDialog === "language"} onOpenChange={() => setShowDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('select_language')}</DialogTitle>
            <DialogDescription>Choose your preferred language</DialogDescription>
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
                className="justify-between"
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

      {/* Privacy Policy */}
      <PrivacyPolicy
        open={showPrivacyPolicy}
        onClose={() => setShowPrivacyPolicy(false)}
      />
    </div>
  );
}
