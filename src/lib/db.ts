// IndexedDB wrapper for offline-first local storage
import {
  User,
  Family,
  Expense,
  Income,
  DebtRecord,
  Budget,
  SyncItem,
  Account,
  Goal,
  GoalTransfer,
  CustomCategory,
  RecurringTransaction,
} from "../types";

const DB_NAME = "KharchaPalDB";
const DB_VERSION = 5;

class Database {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const oldVersion = (event as IDBVersionChangeEvent).oldVersion;

        console.log(`Upgrading database from version ${oldVersion} to ${DB_VERSION}`);

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains("users")) {
          db.createObjectStore("users", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("families")) {
          db.createObjectStore("families", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("expenses")) {
          const expenseStore = db.createObjectStore("expenses", { keyPath: "id" });
          expenseStore.createIndex("family_id", "family_id", { unique: false });
          expenseStore.createIndex("created_by", "created_by", { unique: false });
        }
        if (!db.objectStoreNames.contains("income")) {
          const incomeStore = db.createObjectStore("income", { keyPath: "id" });
          incomeStore.createIndex("family_id", "family_id", { unique: false });
          incomeStore.createIndex("created_by", "created_by", { unique: false });
        }
        if (!db.objectStoreNames.contains("debts")) {
          const debtStore = db.createObjectStore("debts", { keyPath: "id" });
          debtStore.createIndex("family_id", "family_id", { unique: false });
          debtStore.createIndex("status", "status", { unique: false });
        }
        if (!db.objectStoreNames.contains("budgets")) {
          const budgetStore = db.createObjectStore("budgets", { keyPath: "id" });
          budgetStore.createIndex("family_id", "family_id", { unique: false });
        }

        // Version 2: Added accounts store
        if (!db.objectStoreNames.contains("accounts")) {
          const accountStore = db.createObjectStore("accounts", { keyPath: "id" });
          accountStore.createIndex("family_id", "family_id", { unique: false });
        }

        // Version 3: Added goals and goal_transfers stores
        if (!db.objectStoreNames.contains("goals")) {
          const goalStore = db.createObjectStore("goals", { keyPath: "id" });
          goalStore.createIndex("family_id", "family_id", { unique: false });
        }

        if (!db.objectStoreNames.contains("goal_transfers")) {
          const transferStore = db.createObjectStore("goal_transfers", { keyPath: "id" });
          transferStore.createIndex("goal_id", "goal_id", { unique: false });
        }

        if (!db.objectStoreNames.contains("syncQueue")) {
          const syncStore = db.createObjectStore("syncQueue", { keyPath: "id" });
          syncStore.createIndex("status", "status", { unique: false });
        }

        // Version 4: Added custom_categories and recurring_transactions stores
        if (!db.objectStoreNames.contains("custom_categories")) {
          const categoryStore = db.createObjectStore("custom_categories", { keyPath: "id" });
          categoryStore.createIndex("family_id", "family_id", { unique: false });
        }

        if (!db.objectStoreNames.contains("recurring_transactions")) {
          const recurringStore = db.createObjectStore("recurring_transactions", { keyPath: "id" });
          recurringStore.createIndex("family_id", "family_id", { unique: false });
        }
      };
    });
  }

  private getStore(storeName: string, mode: IDBTransactionMode = "readonly") {
    if (!this.db) throw new Error("Database not initialized");
    const transaction = this.db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  // Generic CRUD operations
  async add<T>(storeName: string, data: T): Promise<void> {
    const store = this.getStore(storeName, "readwrite");
    return new Promise((resolve, reject) => {
      const request = store.add(data);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async put<T>(storeName: string, data: T): Promise<void> {
    const store = this.getStore(storeName, "readwrite");
    return new Promise((resolve, reject) => {
      const request = store.put(data);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async get<T>(storeName: string, id: string): Promise<T | undefined> {
    const store = this.getStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    const store = this.getStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllByIndex<T>(
    storeName: string,
    indexName: string,
    value: any
  ): Promise<T[]> {
    const store = this.getStore(storeName);
    const index = store.index(indexName);
    return new Promise((resolve, reject) => {
      const request = index.getAll(value);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, id: string): Promise<void> {
    const store = this.getStore(storeName, "readwrite");
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName: string): Promise<void> {
    const store = this.getStore(storeName, "readwrite");
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Specific methods for app entities
  async addUser(user: User): Promise<void> {
    return this.add("users", user);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.get("users", id);
  }

  async getAllUsers(): Promise<User[]> {
    return this.getAll("users");
  }

  async updateUser(user: User): Promise<void> {
    return this.put("users", user);
  }

  async addFamily(family: Family): Promise<void> {
    return this.add("families", family);
  }

  async getFamily(id: string): Promise<Family | undefined> {
    return this.get("families", id);
  }

  async addExpense(expense: Expense): Promise<void> {
    return this.add("expenses", expense);
  }

  async updateExpense(expense: Expense): Promise<void> {
    return this.put("expenses", expense);
  }

  async getExpensesByFamily(familyId: string): Promise<Expense[]> {
    return this.getAllByIndex("expenses", "family_id", familyId);
  }

  async addIncome(income: Income): Promise<void> {
    return this.add("income", income);
  }

  async updateIncome(income: Income): Promise<void> {
    return this.put("income", income);
  }

  async getIncomeByFamily(familyId: string): Promise<Income[]> {
    return this.getAllByIndex("income", "family_id", familyId);
  }

  async addDebt(debt: DebtRecord): Promise<void> {
    return this.add("debts", debt);
  }

  async updateDebt(debt: DebtRecord): Promise<void> {
    return this.put("debts", debt);
  }

  async getDebtsByFamily(familyId: string): Promise<DebtRecord[]> {
    return this.getAllByIndex("debts", "family_id", familyId);
  }

  async addBudget(budget: Budget): Promise<void> {
    return this.add("budgets", budget);
  }

  async updateBudget(budget: Budget): Promise<void> {
    return this.put("budgets", budget);
  }

  async getBudgetsByFamily(familyId: string): Promise<Budget[]> {
    return this.getAllByIndex("budgets", "family_id", familyId);
  }

  async addAccount(account: Account): Promise<void> {
    return this.add("accounts", account);
  }

  async updateAccount(account: Account): Promise<void> {
    return this.put("accounts", account);
  }

  async getAccountsByFamily(familyId: string): Promise<Account[]> {
    return this.getAllByIndex("accounts", "family_id", familyId);
  }

  async addGoal(goal: Goal): Promise<void> {
    return this.add("goals", goal);
  }

  async updateGoal(goal: Goal): Promise<void> {
    return this.put("goals", goal);
  }

  async getGoalsByFamily(familyId: string): Promise<Goal[]> {
    return this.getAllByIndex("goals", "family_id", familyId);
  }

  async addGoalTransfer(transfer: GoalTransfer): Promise<void> {
    return this.add("goal_transfers", transfer);
  }

  async getGoalTransfersByFamily(familyId: string): Promise<GoalTransfer[]> {
    // Get all transfers and filter by family through goals
    const allTransfers = await this.getAll<GoalTransfer>("goal_transfers");
    const goals = await this.getGoalsByFamily(familyId);
    const goalIds = new Set(goals.map(g => g.id));
    return allTransfers.filter(t => goalIds.has(t.goal_id));
  }

  async addSyncItem(item: SyncItem): Promise<void> {
    return this.add("syncQueue", item);
  }

  async getPendingSyncItems(): Promise<SyncItem[]> {
    return this.getAllByIndex("syncQueue", "status", "pending");
  }

  // Custom Category methods
  async addCustomCategory(category: CustomCategory): Promise<void> {
    return this.add("custom_categories", category);
  }

  async getCustomCategoriesByFamily(familyId: string): Promise<CustomCategory[]> {
    return this.getAllByIndex("custom_categories", "family_id", familyId);
  }

  async deleteCustomCategory(id: string): Promise<void> {
    return this.delete("custom_categories", id);
  }

  // Recurring Transaction methods
  async addRecurringTransaction(transaction: RecurringTransaction): Promise<void> {
    return this.add("recurring_transactions", transaction);
  }

  async updateRecurringTransaction(transaction: RecurringTransaction): Promise<void> {
    return this.put("recurring_transactions", transaction);
  }

  async getRecurringTransactionsByFamily(familyId: string): Promise<RecurringTransaction[]> {
    return this.getAllByIndex("recurring_transactions", "family_id", familyId);
  }

  async deleteRecurringTransaction(id: string): Promise<void> {
    return this.delete("recurring_transactions", id);
  }
}

export const db = new Database();
