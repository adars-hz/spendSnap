import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Trash2, Repeat, Receipt } from 'lucide-react-native';
import { CategoryIcon } from './CategoryIcon';
import { Account, Category, Transaction } from '../types';
import { darkTheme, lightTheme } from '../constants/theme';
import { formatCurrency } from '../constants/currencies';
import { useExpenseStore } from '../store/useExpenseStore';

interface TransactionCardProps {
  transaction: Transaction;
  category?: Category;
  account?: Account;
  onPress?: () => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  category,
  account,
  onPress,
}) => {
  const { isDarkMode, currency, deleteTransaction } = useExpenseStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const isExpense = transaction.type === 'expense';
  const isIncome = transaction.type === 'income';
  const isTransfer = transaction.type === 'transfer';

  const amountColor = isIncome
    ? '#10B981'
    : isExpense
    ? isDarkMode
      ? '#F87171'
      : '#E11D48'
    : '#6366F1';

  const prefix = isIncome ? '+' : isExpense ? '-' : '';

  const handleDelete = () => {
    Alert.alert(
      'Delete Transaction',
      `Are you sure you want to delete this ${transaction.type}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteTransaction(transaction.id),
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={onPress}
    >
      <View style={styles.leftCol}>
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: category ? category.color : isTransfer ? '#6366F1' : theme.surfaceSubtle },
          ]}
        >
          <CategoryIcon
            name={category ? category.icon : isTransfer ? 'ArrowLeftRight' : 'CreditCard'}
            size={18}
            color="#FFFFFF"
          />
        </View>

        <View style={styles.details}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
              {category?.name || (isTransfer ? 'Transfer' : 'General')}
            </Text>
            {transaction.isSubscription && (
              <View style={[styles.subBadge, { backgroundColor: theme.surfaceSubtle }]}>
                <Repeat size={10} color={theme.primary} />
                <Text style={[styles.subText, { color: theme.primary }]}>Recurring</Text>
              </View>
            )}
            {transaction.receiptUri && (
              <View style={[styles.receiptBadge, { backgroundColor: theme.surfaceSubtle }]}>
                <Receipt size={10} color="#6366F1" />
              </View>
            )}
          </View>

          <Text style={[styles.note, { color: theme.textSecondary }]} numberOfLines={1}>
            {transaction.note || (account ? account.name : 'No description')}
          </Text>

          <View style={styles.metaRow}>
            <Text style={[styles.metaText, { color: theme.textMuted }]}>
              {transaction.date}
            </Text>
            {account && (
              <Text style={[styles.accountTag, { color: theme.textMuted }]}>
                • {account.name}
              </Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.rightCol}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {prefix}
          {formatCurrency(transaction.amount, currency)}
        </Text>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={handleDelete}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Trash2 size={14} color={theme.textMuted} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  subBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  subText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  receiptBadge: {
    padding: 3,
    borderRadius: 6,
  },
  note: {
    fontSize: 13,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  metaText: {
    fontSize: 11,
  },
  accountTag: {
    fontSize: 11,
    fontWeight: '500',
  },
  rightCol: {
    alignItems: 'flex-end',
    gap: 6,
  },
  amount: {
    fontSize: 15,
    fontWeight: '800',
  },
  deleteBtn: {
    padding: 2,
  },
});
