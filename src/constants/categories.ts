import { Category } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  // Expenses
  {
    id: 'cat-food',
    name: 'Food & Dining',
    icon: 'Utensils',
    color: '#F97316',
    type: 'expense',
  },
  {
    id: 'cat-groceries',
    name: 'Groceries',
    icon: 'ShoppingCart',
    color: '#10B981',
    type: 'expense',
  },
  {
    id: 'cat-shopping',
    name: 'Shopping',
    icon: 'ShoppingBag',
    color: '#EC4899',
    type: 'expense',
  },
  {
    id: 'cat-transport',
    name: 'Transport',
    icon: 'Car',
    color: '#3B82F6',
    type: 'expense',
  },
  {
    id: 'cat-housing',
    name: 'Rent & Housing',
    icon: 'Home',
    color: '#8B5CF6',
    type: 'expense',
  },
  {
    id: 'cat-bills',
    name: 'Bills & Utilities',
    icon: 'Zap',
    color: '#EAB308',
    type: 'expense',
  },
  {
    id: 'cat-entertainment',
    name: 'Entertainment',
    icon: 'Film',
    color: '#06B6D4',
    type: 'expense',
  },
  {
    id: 'cat-health',
    name: 'Health & Fitness',
    icon: 'HeartPulse',
    color: '#EF4444',
    type: 'expense',
  },
  {
    id: 'cat-travel',
    name: 'Travel & Vacations',
    icon: 'Plane',
    color: '#14B8A6',
    type: 'expense',
  },
  {
    id: 'cat-subscriptions',
    name: 'Subscriptions',
    icon: 'Repeat',
    color: '#6366F1',
    type: 'expense',
  },

  // Incomes
  {
    id: 'cat-salary',
    name: 'Salary',
    icon: 'Briefcase',
    color: '#10B981',
    type: 'income',
  },
  {
    id: 'cat-freelance',
    name: 'Freelance & Side Gig',
    icon: 'Laptop',
    color: '#3B82F6',
    type: 'income',
  },
  {
    id: 'cat-investment',
    name: 'Investments & Dividends',
    icon: 'TrendingUp',
    color: '#8B5CF6',
    type: 'income',
  },
  {
    id: 'cat-gift',
    name: 'Gifts & Bonus',
    icon: 'Gift',
    color: '#EC4899',
    type: 'income',
  },
];
