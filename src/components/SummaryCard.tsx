import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Camera, Plus } from 'lucide-react-native';
import { useExpenseStore } from '../store/useExpenseStore';
import { darkTheme, lightTheme } from '../constants/theme';
import { formatCurrency } from '../constants/currencies';

interface SummaryCardProps {
  onAddExpense: () => void;
  onAddIncome: () => void;
  onTransfer: () => void;
  onSnapReceipt: () => void;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  onAddExpense,
  onAddIncome,
  onTransfer,
  onSnapReceipt,
}) => {
  const { isDarkMode, accounts, transactions, currency, filterAccountId } = useExpenseStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  // Filter accounts and transactions if account filter is set
  const filteredAccounts = filterAccountId
    ? accounts.filter((a) => a.id === filterAccountId)
    : accounts;
  const totalBalance = filteredAccounts.reduce((sum, a) => sum + a.balance, 0);

  // Calculate this month's income & expenses
  const now = new Date();
  const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const currentMonthTransactions = transactions.filter((t) => {
    const matchesAccount = filterAccountId ? t.accountId === filterAccountId : true;
    const matchesMonth = t.date.startsWith(currentMonthPrefix);
    return matchesAccount && matchesMonth;
  });

  const totalIncome = currentMonthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = currentMonthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const savingsRate =
    totalIncome > 0
      ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100))
      : 0;

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      {/* Balance Section */}
      <View style={styles.balanceHeader}>
        <Text style={[styles.balanceLabel, { color: theme.textSecondary }]}>
          TOTAL BALANCE
        </Text>
        {totalIncome > 0 && (
          <View style={[styles.savingsBadge, { backgroundColor: theme.surfaceSubtle }]}>
            <Text style={[styles.savingsBadgeText, { color: theme.primary }]}>
              {savingsRate}% saved this mo.
            </Text>
          </View>
        )}
      </View>

      <Text style={[styles.balanceAmount, { color: theme.text }]}>
        {formatCurrency(totalBalance, currency)}
      </Text>

      {/* Income / Expense Breakdown Pills */}
      <View style={styles.metricsRow}>
        <View style={[styles.metricItem, { backgroundColor: theme.surfaceSubtle }]}>
          <View style={[styles.metricIconWrap, { backgroundColor: '#DCFCE7' }]}>
            <ArrowDownLeft size={16} color="#16A34A" />
          </View>
          <View>
            <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Income</Text>
            <Text style={[styles.metricVal, { color: '#16A34A' }]}>
              +{formatCurrency(totalIncome, currency)}
            </Text>
          </View>
        </View>

        <View style={[styles.metricItem, { backgroundColor: theme.surfaceSubtle }]}>
          <View style={[styles.metricIconWrap, { backgroundColor: '#FFE4E6' }]}>
            <ArrowUpRight size={16} color="#E11D48" />
          </View>
          <View>
            <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Expenses</Text>
            <Text style={[styles.metricVal, { color: '#E11D48' }]}>
              -{formatCurrency(totalExpense, currency)}
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Action Buttons */}
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#F43F5E' }]}
          onPress={onAddExpense}
          activeOpacity={0.8}
        >
          <Plus size={16} color="#FFFFFF" />
          <Text style={styles.actionBtnText}>Expense</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#10B981' }]}
          onPress={onAddIncome}
          activeOpacity={0.8}
        >
          <Plus size={16} color="#FFFFFF" />
          <Text style={styles.actionBtnText}>Income</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#6366F1' }]}
          onPress={onSnapReceipt}
          activeOpacity={0.8}
        >
          <Camera size={16} color="#FFFFFF" />
          <Text style={styles.actionBtnText}>Snap</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.surfaceSubtle }]}
          onPress={onTransfer}
          activeOpacity={0.8}
        >
          <ArrowLeftRight size={16} color={theme.text} />
          <Text style={[styles.actionBtnText, { color: theme.text }]}>Transfer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  savingsBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  savingsBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  balanceAmount: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 18,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  metricItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 14,
  },
  metricIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  metricVal: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 1,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 12,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
