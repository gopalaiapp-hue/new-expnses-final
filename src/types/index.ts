// Core type definitions for KharchaPal

export type UserRole = "admin" | "member";
export type PaymentMethod = "cash" | "upi" | "card" | "bank" | "wallet" | "borrowed";
export type DebtStatus = "pending" | "won" | "lost";
export type SyncStatus = "pending" | "in_progress" | "synced" | "failed";
export type BudgetPeriod = "monthly" | "weekly";
export type TransactionType = "expense" | "income";
export type AccountType = "cash" | "bank" | "card" | "wallet";
export type GoalType =
  | "vehicle_purchase"
  | "housing"
  | "travel"
  | "wedding"
  | "emergency_fund"
  | "education"
  | "electronics"
  | "festival"
  | "business"
  | "gift"
  | "other";
export type GoalPriority = "high" | "medium" | "low";
export type TransferType = "manual" | "auto" | "income_percentage";
export type TransferFrequency = "daily" | "weekly" | "monthly" | "after_income";

export interface User {
  id: string;
  family_id: string;
  name: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface Family {
  id: string;
  name: string;
  created_at: string;
  invite_code: string;
  currency: string;
}

export interface PaymentLine {
  id: string;
  method: PaymentMethod;
  amount: number;
  payer_user_id: string;
  account_id?: string; // Optional reference to which account was used
  meta?: {
    borrowed_from?: string; // User ID if borrowed from family member
    borrowed_from_name?: string; // Custom name if borrowed from someone else
    note?: string;
  };
}

export interface Expense {
  id: string;
  family_id: string;
  created_by: string;
  total_amount: number;
  currency: string;
  category: string;
  date: string;
  notes?: string;
  payment_lines: PaymentLine[];
  attachments: string[]; // Array of file URLs or base64 encoded images
  receipt_urls?: string[]; // Array of uploaded receipt URLs
  is_shared: boolean;
  sync_status: SyncStatus;
  created_at: string;
  updated_at?: string;
}

export interface Income {
  id: string;
  family_id: string;
  created_by: string;
  amount: number;
  currency: string;
  source: string;
  date: string;
  notes?: string;
  is_shared: boolean;
  sync_status: SyncStatus;
  created_at: string;
  updated_at?: string;
}

export interface DebtRecord {
  id: string;
  family_id: string;
  lender_user_id: string;
  borrower_user_id: string;
  amount: number;
  currency: string;
  status: DebtStatus;
  created_at: string;
  linked_expense_id?: string;
  reminder_date?: string;
  reminder_shown: boolean;
  settled_at?: string;
  settlement_message?: string;
  settlement_method?: PaymentMethod;
}

export interface Review {
  id: string;
  family_id: string;
  debt_id: string;
  reviewer_user_id: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  status_snapshot: "won";
  created_at: string;
}

export interface Budget {
  id: string;
  family_id: string;
  category: string;
  limit_amount: number;
  period: BudgetPeriod;
  notify_threshold_percent: number;
  created_by_user_id: string;
  created_at: string;
}

export interface SyncItem {
  id: string;
  entity_type: "expense" | "debt" | "user" | "budget" | "income" | "account" | "goal" | "goal_transfer";
  entity_id: string;
  payload: string;
  status: SyncStatus;
  attempts: number;
  last_attempt_at?: string;
}

export interface Goal {
  id: string;
  family_id: string;
  created_by: string;
  goal_name: string;
  goal_type: GoalType;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  description?: string;
  goal_icon?: string;
  goal_image_url?: string;
  priority: GoalPriority;
  is_shared: boolean;
  is_active: boolean;
  monthly_contribution?: number; // Planned monthly savings amount
  linked_account_id?: string; // Account where goal savings are kept
  created_at: string;
  updated_at?: string;
  completed_at?: string;
  sync_status: SyncStatus;
}

export interface GoalTransfer {
  id: string;
  goal_id: string;
  from_account_id?: string;
  amount: number;
  transfer_type: TransferType;
  transfer_method: PaymentMethod;
  contributed_by: string;
  notes?: string;
  transfer_date: string;
  created_at: string;
  sync_status: SyncStatus;
}

export interface GoalAutoRule {
  id: string;
  goal_id: string;
  rule_type: "fixed_amount" | "percentage" | "round_up";
  rule_value: number;
  frequency: TransferFrequency;
  from_account_id?: string;
  is_active: boolean;
  next_execution?: string;
  created_at: string;
}

export interface GoalMilestone {
  id: string;
  goal_id: string;
  milestone_percentage: number;
  achieved_at?: string;
  celebration_shown: boolean;
}

export interface Account {
  id: string;
  family_id: string;
  name: string;
  type: AccountType;
  opening_balance: number;
  current_balance: number;
  currency: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
}

export interface CustomCategory {
  id: string;
  family_id: string;
  name: string;
  type: "expense" | "income";
  icon?: string;
  created_by: string;
  created_at: string;
}

export type RecurringFrequency = "daily" | "weekly" | "monthly" | "yearly";

export interface RecurringTransaction {
  id: string;
  family_id: string;
  amount: number;
  currency: string;
  category: string;
  description: string;
  frequency: RecurringFrequency;
  start_date: string;
  next_due_date: string;
  last_paid_date?: string;
  is_active: boolean;
  payment_method?: PaymentMethod;
  account_id?: string;
  created_by: string;
  created_at: string;
  auto_deduct?: boolean;
  notify?: boolean;
}

// Category configuration
export const EXPENSE_CATEGORIES = [
  "Groceries",
  "Utilities",
  "Rent",
  "Transportation",
  "Healthcare",
  "Education",
  "Entertainment",
  "Food & Dining",
  "Shopping",
  "Household Items",
  "Personal Care",
  "Gifts",
  "Other",
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

export const INCOME_SOURCES = [
  "Salary",
  "Business",
  "Freelance",
  "Investment",
  "Rental Income",
  "Gift/Bonus",
  "Refund",
  "Other",
] as const;

export type IncomeSource = typeof INCOME_SOURCES[number];
