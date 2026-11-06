import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Account, Category, SavingsGoal, Transaction } from '../types';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import { DEFAULT_ACCOUNTS, DEFAULT_GOALS, SAMPLE_TRANSACTIONS } from '../constants/sampleData';

interface ExpenseState {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  goals: SavingsGoal[];
  currency: string;
  isDarkMode: boolean;
  filterAccountId: string | null;

  // Transaction Actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  deleteTransaction: (id: string) => void;
  editTransaction: (id: string, updates: Partial<Transaction>) => void;

  // Account / Wallet Actions
  addAccount: (acc: Omit<Account, 'id'>) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  transferFunds: (fromAccountId: string, toAccountId: string, amount: number, note?: string) => void;
  setFilterAccount: (id: string | null) => void;

  // Budget & Goal Actions
  updateCategoryBudget: (categoryId: string, limit: number) => void;
  addGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  updateGoalProgress: (id: string, addAmount: number) => void;
  deleteGoal: (id: string) => void;

  // System & Settings Actions
  setCurrency: (currency: string) => void;
  toggleTheme: () => void;
  loadSampleData: () => void;
  resetAllData: () => void;
}

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set, get) => ({
      transactions: SAMPLE_TRANSACTIONS,
      accounts: DEFAULT_ACCOUNTS,
      categories: DEFAULT_CATEGORIES,
      goals: DEFAULT_GOALS,
      currency: 'USD',
      isDarkMode: true,
      filterAccountId: null,

      addTransaction: (txData) => {
        const id = 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
        const newTx: Transaction = {
          ...txData,
          id,
          createdAt: Date.now(),
        };

        set((state) => {
          // Adjust account balance
          const updatedAccounts = state.accounts.map((acc) => {
            if (acc.id === newTx.accountId) {
              const diff = newTx.type === 'income' ? newTx.amount : -newTx.amount;
              return { ...acc, balance: Number((acc.balance + diff).toFixed(2)) };
            }
            return acc;
          });

          return {
            transactions: [newTx, ...state.transactions],
            accounts: updatedAccounts,
          };
        });
      },

      deleteTransaction: (id) => {
        set((state) => {
          const target = state.transactions.find((t) => t.id === id);
          if (!target) return state;

          // Revert account balance
          const updatedAccounts = state.accounts.map((acc) => {
            if (acc.id === target.accountId) {
              const reverseDiff = target.type === 'income' ? -target.amount : target.amount;
              return { ...acc, balance: Number((acc.balance + reverseDiff).toFixed(2)) };
            }
            if (target.type === 'transfer' && target.toAccountId && acc.id === target.toAccountId) {
              return { ...acc, balance: Number((acc.balance - target.amount).toFixed(2)) };
            }
            return acc;
          });

          return {
            transactions: state.transactions.filter((t) => t.id !== id),
            accounts: updatedAccounts,
          };
        });
      },

      editTransaction: (id, updates) => {
        set((state) => ({
          transactions: state.transactions.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
      },

      addAccount: (accData) => {
        const id = 'acc_' + Date.now();
        set((state) => ({
          accounts: [...state.accounts, { ...accData, id }],
        }));
      },

      updateAccount: (id, updates) => {
        set((state) => ({
          accounts: state.accounts.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        }));
      },

      deleteAccount: (id) => {
        set((state) => ({
          accounts: state.accounts.filter((a) => a.id !== id),
          transactions: state.transactions.filter((t) => t.accountId !== id && t.toAccountId !== id),
        }));
      },

      transferFunds: (fromAccountId, toAccountId, amount, note = 'Wallet Transfer') => {
        const id = 'transfer_' + Date.now();
        const date = new Date().toISOString().split('T')[0];

        const newTx: Transaction = {
          id,
          type: 'transfer',
          amount,
          categoryId: 'cat-bills',
          accountId: fromAccountId,
          toAccountId,
          date,
          note,
          createdAt: Date.now(),
        };

        set((state) => {
          const updatedAccounts = state.accounts.map((acc) => {
            if (acc.id === fromAccountId) {
              return { ...acc, balance: Number((acc.balance - amount).toFixed(2)) };
            }
            if (acc.id === toAccountId) {
              return { ...acc, balance: Number((acc.balance + amount).toFixed(2)) };
            }
            return acc;
          });

          return {
            transactions: [newTx, ...state.transactions],
            accounts: updatedAccounts,
          };
        });
      },

      setFilterAccount: (id) => {
        set({ filterAccountId: id });
      },

      updateCategoryBudget: (categoryId, limit) => {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === categoryId ? { ...c, budgetLimit: limit } : c
          ),
        }));
      },

      addGoal: (goalData) => {
        const id = 'goal_' + Date.now();
        set((state) => ({
          goals: [...state.goals, { ...goalData, id }],
        }));
      },

      updateGoalProgress: (id, addAmount) => {
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id
              ? { ...g, currentAmount: Number((g.currentAmount + addAmount).toFixed(2)) }
              : g
          ),
        }));
      },

      deleteGoal: (id) => {
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
        }));
      },

      setCurrency: (currency) => {
        set({ currency });
      },

      toggleTheme: () => {
        set((state) => ({ isDarkMode: !state.isDarkMode }));
      },

      loadSampleData: () => {
        set({
          transactions: SAMPLE_TRANSACTIONS,
          accounts: DEFAULT_ACCOUNTS,
          categories: DEFAULT_CATEGORIES,
          goals: DEFAULT_GOALS,
        });
      },

      resetAllData: () => {
        set({
          transactions: [],
          accounts: [
            {
              id: 'acc-main',
              name: 'Cash / Main',
              type: 'cash',
              balance: 0,
              currency: 'USD',
              color: '#10B981',
              icon: 'Wallet',
              isDefault: true,
            },
          ],
          categories: DEFAULT_CATEGORIES,
          goals: [],
        });
      },
    }),
    {
      name: 'spendsnap-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

