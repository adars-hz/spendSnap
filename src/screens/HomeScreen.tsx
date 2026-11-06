import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Search, SlidersHorizontal, PlusCircle } from 'lucide-react-native';
import { SummaryCard } from '../components/SummaryCard';
import { TransactionCard } from '../components/TransactionCard';
import { useExpenseStore } from '../store/useExpenseStore';
import { darkTheme, lightTheme } from '../constants/theme';
import { TransactionType } from '../types';

interface HomeScreenProps {
  onAddTransaction: (type?: TransactionType) => void;
  onSnapReceipt: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onAddTransaction,
  onSnapReceipt,
}) => {
  const { isDarkMode, transactions, categories, accounts, filterAccountId } = useExpenseStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | 'expense' | 'income'>('all');

  // Filter transactions
  const filteredTransactions = transactions.filter((t) => {
    // Account filter
    if (filterAccountId && t.accountId !== filterAccountId && t.toAccountId !== filterAccountId) {
      return false;
    }
    // Type filter
    if (selectedTypeFilter !== 'all' && t.type !== selectedTypeFilter) {
      return false;
    }
    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const cat = categories.find((c) => c.id === t.categoryId);
      const matchesNote = t.note.toLowerCase().includes(q);
      const matchesCategory = cat?.name.toLowerCase().includes(q);
      const matchesTags = (t.tags || []).some((tag) => tag.toLowerCase().includes(q));
      if (!matchesNote && !matchesCategory && !matchesTags) return false;
    }
    return true;
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Balance Summary Card */}
      <SummaryCard
        onAddExpense={() => onAddTransaction('expense')}
        onAddIncome={() => onAddTransaction('income')}
        onTransfer={() => onAddTransaction('transfer')}
        onSnapReceipt={onSnapReceipt}
      />

      {/* Filter and Search Bar */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
          <Search size={16} color={theme.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search transactions, notes, tags..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Pills */}
        <View style={styles.filterPillsRow}>
          <TouchableOpacity
            style={[
              styles.filterPill,
              {
                backgroundColor: selectedTypeFilter === 'all' ? theme.primary : theme.surfaceSubtle,
              },
            ]}
            onPress={() => setSelectedTypeFilter('all')}
          >
            <Text
              style={[
                styles.filterPillText,
                { color: selectedTypeFilter === 'all' ? '#FFFFFF' : theme.textSecondary },
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              {
                backgroundColor: selectedTypeFilter === 'expense' ? '#F43F5E' : theme.surfaceSubtle,
              },
            ]}
            onPress={() => setSelectedTypeFilter('expense')}
          >
            <Text
              style={[
                styles.filterPillText,
                { color: selectedTypeFilter === 'expense' ? '#FFFFFF' : theme.textSecondary },
              ]}
            >
              Expenses
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              {
                backgroundColor: selectedTypeFilter === 'income' ? '#10B981' : theme.surfaceSubtle,
              },
            ]}
            onPress={() => setSelectedTypeFilter('income')}
          >
            <Text
              style={[
                styles.filterPillText,
                { color: selectedTypeFilter === 'income' ? '#FFFFFF' : theme.textSecondary },
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity Header */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Activity</Text>
        <Text style={[styles.sectionCount, { color: theme.textMuted }]}>
          {filteredTransactions.length} items
        </Text>
      </View>

      {/* Transactions List */}
      {filteredTransactions.length > 0 ? (
        filteredTransactions.map((tx) => {
          const category = categories.find((c) => c.id === tx.categoryId);
          const account = accounts.find((a) => a.id === tx.accountId);
          return (
            <TransactionCard
              key={tx.id}
              transaction={tx}
              category={category}
              account={account}
            />
          );
        })
      ) : (
        <View style={[styles.emptyBox, { backgroundColor: theme.surfaceSubtle }]}>
          <PlusCircle size={36} color={theme.textMuted} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No transactions found</Text>
          <Text style={[styles.emptySub, { color: theme.textMuted }]}>
            {searchQuery
              ? 'Try modifying your search or filter criteria.'
              : 'Tap "+ Expense" or "Snap" to log your first transaction.'}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  searchSection: {
    paddingHorizontal: 16,
    marginTop: 10,
    gap: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyBox: {
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 18,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 6,
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 260,
  },
});

