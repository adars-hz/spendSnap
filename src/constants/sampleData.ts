import { Account, SavingsGoal, Transaction } from '../types';

export const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: 'acc-main',
    name: 'Main Checking',
    type: 'bank',
    balance: 0,
    currency: 'USD',
    color: '#3B82F6',
    icon: 'Building2',
    isDefault: true,
  },
  {
    id: 'acc-cash',
    name: 'Cash Wallet',
    type: 'cash',
    balance: 0,
    currency: 'USD',
    color: '#F59E0B',
    icon: 'Wallet',
  },
];

export const DEFAULT_GOALS: SavingsGoal[] = [];

export const SAMPLE_TRANSACTIONS: Transaction[] = [];
