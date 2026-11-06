export type TransactionType = 'expense' | 'income' | 'transfer';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  accountId: string;
  toAccountId?: string; // used when type === 'transfer'
  date: string; // ISO date string (YYYY-MM-DD or full timestamp)
  note: string;
  tags?: string[];
  receiptUri?: string;
  isSubscription?: boolean;
  recurringInterval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon identifier
  color: string;
  type: 'expense' | 'income';
  budgetLimit?: number; // Optional monthly budget cap
}

export type AccountType = 'cash' | 'bank' | 'credit' | 'savings' | 'wallet';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  color: string;
  icon: string;
  isDefault?: boolean;
}

export interface Budget {
  id: string;
  categoryId: string;
  limit: number;
  period: 'monthly' | 'weekly';
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  icon: string;
  color: string;
}

export type TabType = 'home' | 'analytics' | 'snap' | 'budgets' | 'wallets';

export type DateFilterRange = 'this_month' | 'last_month' | 'last_30_days' | 'this_year' | 'all';

