import { useState } from "react";
import { Button } from "./ui/button";
import { Plus, TrendingDown, TrendingUp, Zap, Upload, Filter, X } from "lucide-react";
import { DashboardStats } from "./dashboard/DashboardStats";
import { TopSpending } from "./dashboard/TopSpending";
import { ExpenseList } from "./expense/ExpenseList";
import { IncomeList } from "./income/IncomeList";
import { GoalList } from "./goal/GoalList";
import { AddGoalDialog } from "./goal/AddGoalDialog";
import { AddTransactionModal } from "./transaction/AddTransactionModal";
import { QuickAddDialog } from "./transaction/QuickAddDialog";
import { ImportUPIDialog } from "./transaction/ImportUPIDialog";
import { TransactionFilterDialog, type FilterState } from "./transaction/TransactionFilterDialog";
import { ReportsScreen } from "./analytics/ReportsScreen";
import { MoreSection } from "./MoreSection";
import { BottomNav } from "./BottomNav";
import { useApp } from "../lib/store";
import { useLanguage } from "../lib/language";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import logo from "../logo/kharchapal.png";

// Type declaration for logo import
declare module "*.png";

export function MainDashboard() {
  const { currentUser, currentFamily } = useApp();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("home");
  const [transactionsSubTab, setTransactionsSubTab] = useState("expenses");
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [transactionType, setTransactionType] = useState<"expense" | "income">("expense");
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showImportUPI, setShowImportUPI] = useState(false);
  const [showReportsScreen, setShowReportsScreen] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    searchQuery: "",
    timeRange: "all",
    category: "All Categories",
    mode: "All Modes",
  });
  const [hasFiltersApplied, setHasFiltersApplied] = useState(false);

  const handleFABClick = () => {
    if (transactionsSubTab === "income") {
      setTransactionType("income");
    } else {
      setTransactionType("expense");
    }
    setShowAddTransaction(true);
  };

  const handleApplyFilters = (filters: FilterState) => {
    setActiveFilters(filters);
    setHasFiltersApplied(
      filters.searchQuery !== "" ||
      filters.timeRange !== "all" ||
      filters.category !== "All Categories" ||
      filters.mode !== "All Modes"
    );
    setShowFilter(false);
  };

  const handleClearFilters = () => {
    setActiveFilters({
      searchQuery: "",
      timeRange: "all",
      category: "All Categories",
      mode: "All Modes",
    });
    setHasFiltersApplied(false);
  };

  const showFAB = activeTab === "home" || activeTab === "transactions";

  // If showing reports screen, render it instead
  if (showReportsScreen) {
    return <ReportsScreen onBack={() => setShowReportsScreen(false)} />;
  }

  return (
    <div className="min-h-screen bg-background pb-safe">
      {/* Material Design 3 Top App Bar - Simplified */}
      <header className="bg-primary text-primary-foreground elevation-2 sticky top-0 z-10 pt-safe">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="KharchaPal" className="h-8 w-8" />
            <div className="min-w-0 flex-1">
              <h1 className="truncate">{currentFamily?.name}</h1>
              <div className="flex items-center gap-2">
                <p className="text-sm opacity-90 truncate">
                  {currentUser?.name}
                </p>
                {currentUser?.role === "admin" && (
                  <Badge variant="secondary" className="text-xs bg-primary-container text-on-primary-container shrink-0">
                    Admin
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Scrollable container */}
      <main className="max-w-4xl mx-auto px-4 py-4 pb-4">
        {/* Home View */}
        {activeTab === "home" && (
          <div className="space-y-4">
            {/* Welcome Message */}
            <div className="bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 rounded-2xl p-5 border border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <span className="text-2xl font-bold">₹</span>
                  </div>
                  <div>
                    <h2 className="flex items-center gap-2 text-xl font-semibold">
                      {t('welcome')}, {currentUser?.name}! 🙏
                    </h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="text-4xl">
                  {new Date().getHours() < 12 ? "🌅" : new Date().getHours() < 17 ? "☀️" : "🌙"}
                </div>
              </div>
            </div>



            {/* Quick Add & Import UPI */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowQuickAdd(true)}
                className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all duration-200"
              >
                <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
                <div className="text-center">
                  <p className="font-semibold text-green-900 dark:text-green-100">{t('quick_add')}</p>
                  <p className="text-xs text-green-700 dark:text-green-300">{t('quick_add_desc')}</p>
                </div>
              </button>
              <button
                onClick={() => setShowImportUPI(true)}
                className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all duration-200"
              >
                <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <div className="text-center">
                  <p className="font-semibold text-blue-900 dark:text-blue-100">{t('import_upi')}</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">{t('import_upi_desc')}</p>
                </div>
              </button>
            </div>

            <DashboardStats />

            <TopSpending />

            <div>
              <h3 className="mb-3">{t('recent_transactions')}</h3>
              <Tabs value={transactionsSubTab} onValueChange={setTransactionsSubTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-surface-variant/50 p-1 rounded-xl">
                  <TabsTrigger value="expenses" className="rounded-lg data-[state=active]:bg-primary-container data-[state=active]:text-on-primary-container">
                    {t('expenses')}
                  </TabsTrigger>
                  <TabsTrigger value="income" className="rounded-lg data-[state=active]:bg-primary-container data-[state=active]:text-on-primary-container">
                    {t('income')}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="expenses" className="mt-4">
                  <ExpenseList />
                </TabsContent>

                <TabsContent value="income" className="mt-4">
                  <IncomeList />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}

        {/* Transactions View */}
        {activeTab === "transactions" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2>{t('transactions')}</h2>
              <div className="flex items-center gap-2">
                {hasFiltersApplied && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="gap-2 h-9 px-3"
                  >
                    <X className="h-4 w-4" />
                    Clear Filters
                  </Button>
                )}
                <Button
                  variant={hasFiltersApplied ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowFilter(true)}
                  className="gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filter
                  {hasFiltersApplied && (
                    <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                      On
                    </Badge>
                  )}
                </Button>
              </div>
            </div>
            <Tabs value={transactionsSubTab} onValueChange={setTransactionsSubTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-surface-variant/50 p-1 rounded-xl">
                <TabsTrigger value="expenses" className="rounded-lg data-[state=active]:bg-primary-container data-[state=active]:text-on-primary-container">
                  {t('expenses')}
                </TabsTrigger>
                <TabsTrigger value="income" className="rounded-lg data-[state=active]:bg-primary-container data-[state=active]:text-on-primary-container">
                  {t('income')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="expenses" className="mt-4">
                <ExpenseList filters={activeFilters} />
              </TabsContent>

              <TabsContent value="income" className="mt-4">
                <IncomeList filters={activeFilters} />
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Goals View */}
        {activeTab === "goals" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2>{t('savings_goals')}</h2>
                <p className="text-sm text-muted-foreground mt-1">Track your financial targets</p>
              </div>
              <Button size="sm" onClick={() => setShowAddGoal(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Goal
              </Button>
            </div>
            <GoalList />
          </div>
        )}

        {/* More View */}
        {activeTab === "more" && (
          <div className="space-y-4">
            <h2>{t('more_options')}</h2>
            <MoreSection onShowReports={() => setShowReportsScreen(true)} />
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Material Design 3 FAB - Icon Only - Positioned higher above navigation */}
      {showFAB && (
        <div className="fixed right-4 bottom-4 z-40" style={{
          bottom: 'calc(max(env(safe-area-inset-bottom), 16px) + 84px)' // Increased from 16px to 84px to be above navigation
        }}>
          <Button
            size="icon"
            className="rounded-full h-14 w-14 elevation-4 hover:elevation-5 bg-tertiary hover:bg-tertiary/90 text-tertiary-foreground transition-all duration-300 hover:scale-105 active:scale-95"
            onClick={handleFABClick}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Modals & Dialogs */}
      <AddTransactionModal
        open={showAddTransaction}
        onClose={() => setShowAddTransaction(false)}
        defaultType={transactionType}
      />
      <QuickAddDialog open={showQuickAdd} onClose={() => setShowQuickAdd(false)} />
      <ImportUPIDialog open={showImportUPI} onClose={() => setShowImportUPI(false)} />
      <AddGoalDialog open={showAddGoal} onClose={() => setShowAddGoal(false)} />
      <TransactionFilterDialog
        open={showFilter}
        onClose={() => setShowFilter(false)}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  );
}
