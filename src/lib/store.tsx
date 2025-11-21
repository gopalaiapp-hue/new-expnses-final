// Global state management using React Context
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Family, Expense, Income, DebtRecord, Budget, Account, Goal, GoalTransfer } from "../types";
import { db } from "./db";

interface AppState {
  currentUser: User | null;
  currentFamily: Family | null;
  users: User[];
  expenses: Expense[];
  income: Income[];
  debts: DebtRecord[];
  budgets: Budget[];
  accounts: Account[];
  goals: Goal[];
  goalTransfers: GoalTransfer[];
  isLoading: boolean;
}

interface AppContextType extends AppState {
  setCurrentUser: (user: User | null) => void;
  setCurrentFamily: (family: Family | null) => void;
  loadFamilyData: () => Promise<void>;
  addExpense: (expense: Expense) => Promise<void>;
  updateExpense: (expense: Expense) => Promise<void>;
  addIncome: (income: Income) => Promise<void>;
  updateIncome: (income: Income) => Promise<void>;
  addDebt: (debt: DebtRecord) => Promise<void>;
  updateDebt: (debt: DebtRecord) => Promise<void>;
  addBudget: (budget: Budget) => Promise<void>;
  updateBudget: (budget: Budget) => Promise<void>;
  addAccount: (account: Account) => Promise<void>;
  updateAccount: (account: Account) => Promise<void>;
  addGoal: (goal: Goal) => Promise<void>;
  updateGoal: (goal: Goal) => Promise<void>;
  addGoalTransfer: (transfer: GoalTransfer) => Promise<void>;
  addUser: (user: User) => Promise<void>;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    currentUser: null,
    currentFamily: null,
    users: [],
    expenses: [],
    income: [],
    debts: [],
    budgets: [],
    accounts: [],
    goals: [],
    goalTransfers: [],
    isLoading: true,
  });

  // Initialize database and load saved session
  useEffect(() => {
    const initApp = async () => {
      try {
        console.log("Initializing KharchaPal...");
        await db.init();
        console.log("Database initialized successfully");
        
        // Try to restore session from localStorage
        const savedUserId = localStorage.getItem("currentUserId");
        const savedFamilyId = localStorage.getItem("currentFamilyId");
        
        if (savedUserId && savedFamilyId) {
          console.log("Attempting to restore session...");
          const user = await db.getUser(savedUserId);
          const family = await db.getFamily(savedFamilyId);
          
          if (user && family) {
            console.log("Session restored successfully");
            setState(prev => ({
              ...prev,
              currentUser: user,
              currentFamily: family,
            }));
            await loadFamilyDataInternal(savedFamilyId);
          } else {
            console.log("Session data not found, clearing localStorage");
            localStorage.removeItem("currentUserId");
            localStorage.removeItem("currentFamilyId");
          }
        } else {
          console.log("No saved session found");
        }
      } catch (error) {
        console.error("Failed to initialize app:", error);
        // If there's a database error, try to recover by clearing it
        if (error instanceof Error && error.name === "InvalidStateError") {
          console.log("Attempting to recover from database error...");
          try {
            indexedDB.deleteDatabase("KharchaPalDB");
            localStorage.clear();
            console.log("Database reset. Please refresh the page.");
          } catch (deleteError) {
            console.error("Failed to reset database:", deleteError);
          }
        }
      } finally {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initApp();
  }, []);

  const loadFamilyDataInternal = async (familyId: string) => {
    try {
      const [users, expenses, income, debts, budgets, accounts, goals, goalTransfers] = await Promise.all([
        db.getAllUsers(),
        db.getExpensesByFamily(familyId),
        db.getIncomeByFamily(familyId),
        db.getDebtsByFamily(familyId),
        db.getBudgetsByFamily(familyId),
        db.getAccountsByFamily(familyId),
        db.getGoalsByFamily?.(familyId) ?? Promise.resolve([]),
        db.getGoalTransfersByFamily?.(familyId) ?? Promise.resolve([]),
      ]);

      setState(prev => ({
        ...prev,
        users: users.filter(u => u.family_id === familyId),
        expenses: expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        income: income.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        debts,
        budgets,
        accounts,
        goals: goals.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
        goalTransfers,
      }));
    } catch (error) {
      console.error("Failed to load family data:", error);
    }
  };

  const setCurrentUser = (user: User | null) => {
    setState(prev => ({ ...prev, currentUser: user }));
    if (user) {
      localStorage.setItem("currentUserId", user.id);
    } else {
      localStorage.removeItem("currentUserId");
    }
  };

  const setCurrentFamily = (family: Family | null) => {
    setState(prev => ({ ...prev, currentFamily: family }));
    if (family) {
      localStorage.setItem("currentFamilyId", family.id);
    } else {
      localStorage.removeItem("currentFamilyId");
    }
  };

  const loadFamilyData = async () => {
    if (state.currentFamily) {
      await loadFamilyDataInternal(state.currentFamily.id);
    }
  };

  const addExpense = async (expense: Expense) => {
    await db.addExpense(expense);

    // Update account balances for payment lines with account_id
    const updatedAccounts = [...prev.accounts];
    for (const paymentLine of expense.payment_lines) {
      if (paymentLine.account_id) {
        const accountIndex = prev.accounts.findIndex(a => a.id === paymentLine.account_id);
        if (accountIndex !== -1) {
          const account = prev.accounts[accountIndex];
          updatedAccounts[accountIndex] = {
            ...account,
            current_balance: account.current_balance - paymentLine.amount,
            updated_at: new Date().toISOString(),
          };
          await db.updateAccount(updatedAccounts[accountIndex]);
        }
      }
    }

    setState(prev => ({
      ...prev,
      expenses: [expense, ...prev.expenses],
      accounts: updatedAccounts,
    }));
  };

  const updateExpense = async (expense: Expense) => {
    await db.updateExpense(expense);
    setState(prev => ({
      ...prev,
      expenses: prev.expenses.map(e => e.id === expense.id ? expense : e),
    }));
  };

  const addIncome = async (income: Income) => {
    await db.addIncome(income);
    setState(prev => ({
      ...prev,
      income: [income, ...prev.income],
    }));
  };

  const updateIncome = async (income: Income) => {
    await db.updateIncome(income);
    setState(prev => ({
      ...prev,
      income: prev.income.map(i => i.id === income.id ? income : i),
    }));
  };

  const addDebt = async (debt: DebtRecord) => {
    await db.addDebt(debt);
    setState(prev => ({
      ...prev,
      debts: [...prev.debts, debt],
    }));
  };

  const updateDebt = async (debt: DebtRecord) => {
    await db.updateDebt(debt);
    setState(prev => ({
      ...prev,
      debts: prev.debts.map(d => d.id === debt.id ? debt : d),
    }));
  };

  const addBudget = async (budget: Budget) => {
    await db.addBudget(budget);
    setState(prev => ({
      ...prev,
      budgets: [...prev.budgets, budget],
    }));
  };

  const updateBudget = async (budget: Budget) => {
    await db.updateBudget(budget);
    setState(prev => ({
      ...prev,
      budgets: prev.budgets.map(b => b.id === budget.id ? budget : b),
    }));
  };

  const addUser = async (user: User) => {
    await db.addUser(user);
    setState(prev => ({
      ...prev,
      users: [...prev.users, user],
    }));
  };

  const addAccount = async (account: Account) => {
    await db.addAccount(account);
    setState(prev => ({
      ...prev,
      accounts: [...prev.accounts, account],
    }));
  };

  const updateAccount = async (account: Account) => {
    await db.updateAccount(account);
    setState(prev => ({
      ...prev,
      accounts: prev.accounts.map(a => a.id === account.id ? account : a),
    }));
  };

  const addGoal = async (goal: Goal) => {
    await db.addGoal?.(goal);
    setState(prev => ({
      ...prev,
      goals: [...prev.goals, goal],
    }));
  };

  const updateGoal = async (goal: Goal) => {
    await db.updateGoal?.(goal);
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(g => g.id === goal.id ? goal : g),
    }));
  };

  const addGoalTransfer = async (transfer: GoalTransfer) => {
    await db.addGoalTransfer?.(transfer);

    // Also create an expense for the goal transfer
    if (transfer.contributed_by && state.currentFamily && state.currentUser) {
      const goalExpense: Expense = {
        id: `goal-${transfer.id}`,
        family_id: state.currentFamily.id,
        created_by: transfer.contributed_by,
        total_amount: transfer.amount,
        currency: "INR", // Assuming INR, could be from family settings
        category: "goal",
        date: transfer.transfer_date,
        notes: `Goal contribution: ${state.goals.find(g => g.id === transfer.goal_id)?.goal_name || 'Unknown goal'}`,
        payment_lines: [{
          id: (`payment-${transfer.id}`),
          method: transfer.transfer_method,
          amount: transfer.amount,
          payer_user_id: transfer.contributed_by,
          account_id: transfer.from_account_id,
          meta: {
            note: `Goal transfer to ${state.goals.find(g => g.id === transfer.goal_id)?.goal_name || 'Unknown goal'}`
          }
        }],
        attachments: [],
        is_shared: true,
        sync_status: "synced",
        created_at: transfer.created_at,
        updated_at: transfer.created_at,
      };

      await db.addExpense(goalExpense);

      setState(prev => ({
        ...prev,
        expenses: [goalExpense, ...prev.expenses],
        goalTransfers: [...prev.goalTransfers, transfer],
      }));
    } else {
      setState(prev => ({
        ...prev,
        goalTransfers: [...prev.goalTransfers, transfer],
      }));
    }
  };

  const logout = () => {
    localStorage.removeItem("currentUserId");
    localStorage.removeItem("currentFamilyId");
    setState({
      currentUser: null,
      currentFamily: null,
      users: [],
      expenses: [],
      income: [],
      debts: [],
      budgets: [],
      accounts: [],
      goals: [],
      goalTransfers: [],
      isLoading: false,
    });
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        setCurrentUser,
        setCurrentFamily,
        loadFamilyData,
        addExpense,
        updateExpense,
        addIncome,
        updateIncome,
        addDebt,
        updateDebt,
        addBudget,
        updateBudget,
        addAccount,
        updateAccount,
        addGoal,
        updateGoal,
        addGoalTransfer,
        addUser,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
