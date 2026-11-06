import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Sparkles, TrendingUp, TrendingDown, Calendar } from 'lucide-react-native';
import { DonutChart } from '../components/Charts/DonutChart';
import { BarChart, BarDataPoint } from '../components/Charts/BarChart';
import { useExpenseStore } from '../store/useExpenseStore';
import { darkTheme, lightTheme } from '../constants/theme';
import { formatCurrency } from '../constants/currencies';
import { DateFilterRange } from '../types';

export const AnalyticsScreen: React.FC = () => {
  const { isDarkMode, transactions, categories, currency } = useExpenseStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const [timeRange, setTimeRange] = useState<DateFilterRange>('this_month');

  // Filter transactions according to selected range
  const now = new Date();
  const filteredTransactions = transactions.filter((t) => {
    const txDate = new Date(t.date);
    if (timeRange === 'this_month') {
      return (
        txDate.getMonth() === now.getMonth() &&
        txDate.getFullYear() === now.getFullYear()
      );
    }
    if (timeRange === 'last_30_days') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
      return txDate >= thirtyDaysAgo;
    }
    if (timeRange === 'this_year') {
      return txDate.getFullYear() === now.getFullYear();
    }
    return true; // 'all'
  });

  const expenseTxs = filteredTransactions.filter((t) => t.type === 'expense');
  const incomeTxs = filteredTransactions.filter((t) => t.type === 'income');

  const totalExpense = expenseTxs.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = incomeTxs.reduce((sum, t) => sum + t.amount, 0);
  const netSavings = totalIncome - totalExpense;

  // Group expenses by category
  const categoryTotalsMap: { [catId: string]: number } = {};
  expenseTxs.forEach((t) => {
    categoryTotalsMap[t.categoryId] = (categoryTotalsMap[t.categoryId] || 0) + t.amount;
  });

  const donutData = Object.keys(categoryTotalsMap).map((catId) => ({
    categoryId: catId,
    amount: categoryTotalsMap[catId],
  }));

  // Generate 6-month historical trend data for BarChart
  const barChartData: BarDataPoint[] = [];
  for (let i = 4; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = d.toLocaleString('default', { month: 'short' });
    const yearMonthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    const monthTxs = transactions.filter((t) => t.date.startsWith(yearMonthStr));
    const mExpense = monthTxs
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const mIncome = monthTxs
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    barChartData.push({
      label: monthName,
      expense: mExpense,
      income: mIncome,
    });
  }

  // Top spending category
  const topCategoryEntry = Object.entries(categoryTotalsMap).sort((a, b) => b[1] - a[1])[0];
  const topCategory = topCategoryEntry
    ? categories.find((c) => c.id === topCategoryEntry[0])
    : null;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Time Range Selector */}
      <View style={styles.rangeSelector}>
        <TouchableOpacity
          style={[
            styles.rangePill,
            timeRange === 'this_month' && { backgroundColor: theme.primary },
          ]}
          onPress={() => setTimeRange('this_month')}
        >
          <Text
            style={[
              styles.rangePillText,
              { color: timeRange === 'this_month' ? '#FFFFFF' : theme.textSecondary },
            ]}
          >
            This Month
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.rangePill,
            timeRange === 'last_30_days' && { backgroundColor: theme.primary },
          ]}
          onPress={() => setTimeRange('last_30_days')}
        >
          <Text
            style={[
              styles.rangePillText,
              { color: timeRange === 'last_30_days' ? '#FFFFFF' : theme.textSecondary },
            ]}
          >
            Last 30 Days
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.rangePill,
            timeRange === 'this_year' && { backgroundColor: theme.primary },
          ]}
          onPress={() => setTimeRange('this_year')}
        >
          <Text
            style={[
              styles.rangePillText,
              { color: timeRange === 'this_year' ? '#FFFFFF' : theme.textSecondary },
            ]}
          >
            This Year
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.rangePill,
            timeRange === 'all' && { backgroundColor: theme.primary },
          ]}
          onPress={() => setTimeRange('all')}
        >
          <Text
            style={[
              styles.rangePillText,
              { color: timeRange === 'all' ? '#FFFFFF' : theme.textSecondary },
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
      </View>

      {/* High-Level Stat Cards */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.statLabel, { color: theme.textMuted }]}>TOTAL SPENT</Text>
          <Text style={[styles.statVal, { color: '#F43F5E' }]}>
            {formatCurrency(totalExpense, currency)}
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.statLabel, { color: theme.textMuted }]}>NET SAVINGS</Text>
          <Text
            style={[
              styles.statVal,
              { color: netSavings >= 0 ? '#10B981' : '#F43F5E' },
            ]}
          >
            {formatCurrency(netSavings, currency)}
          </Text>
        </View>
      </View>

      {/* AI Financial Insights Card */}
      <View style={[styles.aiCard, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
        <View style={styles.aiHeader}>
          <View style={styles.aiIconBadge}>
            <Sparkles size={16} color="#6366F1" />
          </View>
          <Text style={[styles.aiTitle, { color: theme.text }]}>SpendSnap AI Advisor</Text>
        </View>
        <Text style={[styles.aiBody, { color: theme.textSecondary }]}>
          {topCategory
            ? `Your largest expense area is ${topCategory.name} (${formatCurrency(
                topCategoryEntry[1],
                currency
              )}). Keeping this within your budget will save you an estimated ${formatCurrency(
                topCategoryEntry[1] * 0.15,
                currency
              )} next month.`
            : 'Track a few more expenses to receive personalized AI spending optimization suggestions!'}
        </Text>
      </View>

      {/* Category Breakdown Donut Chart */}
      <View style={[styles.chartSectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.chartSectionTitle, { color: theme.text }]}>
          Spending by Category
        </Text>
        <DonutChart data={donutData} totalAmount={totalExpense} />
      </View>

      {/* Monthly Cash Flow Trend Bars */}
      <View style={[styles.chartSectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.chartSectionTitle, { color: theme.text }]}>
          Monthly Cash Flow Trend
        </Text>
        <BarChart data={barChartData} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  rangeSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(55, 65, 81, 0.2)',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  rangePill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  rangePillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statVal: {
    fontSize: 22,
    fontWeight: '800',
  },
  aiCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  aiBody: {
    fontSize: 13,
    lineHeight: 19,
  },
  chartSectionCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
  },
  chartSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
});

