import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { darkTheme, lightTheme } from '../../constants/theme';
import { useExpenseStore } from '../../store/useExpenseStore';
import { formatCurrency } from '../../constants/currencies';

export interface BarDataPoint {
  label: string;
  expense: number;
  income: number;
}

interface BarChartProps {
  data: BarDataPoint[];
  maxHeight?: number;
}

export const BarChart: React.FC<BarChartProps> = ({ data, maxHeight = 120 }) => {
  const { isDarkMode, currency } = useExpenseStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.expense, d.income)),
    100
  );

  return (
    <View style={styles.container}>
      <View style={[styles.chartArea, { height: maxHeight }]}>
        {data.map((item, index) => {
          const expenseHeight = Math.max((item.expense / maxVal) * maxHeight, 4);
          const incomeHeight = Math.max((item.income / maxVal) * maxHeight, 4);

          return (
            <View key={index} style={styles.barGroup}>
              <View style={styles.barsContainer}>
                {/* Income bar */}
                <View
                  style={[
                    styles.bar,
                    {
                      height: incomeHeight,
                      backgroundColor: '#10B981',
                    },
                  ]}
                />
                {/* Expense bar */}
                <View
                  style={[
                    styles.bar,
                    {
                      height: expenseHeight,
                      backgroundColor: '#F43F5E',
                    },
                  ]}
                />
              </View>
              <Text style={[styles.barLabel, { color: theme.textMuted }]}>
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Mini Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendBadge}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={[styles.legendText, { color: theme.textSecondary }]}>Income</Text>
        </View>
        <View style={styles.legendBadge}>
          <View style={[styles.legendDot, { backgroundColor: '#F43F5E' }]} />
          <Text style={[styles.legendText, { color: theme.textSecondary }]}>Expense</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    paddingBottom: 4,
  },
  barGroup: {
    alignItems: 'center',
    flex: 1,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    marginBottom: 6,
  },
  bar: {
    width: 10,
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 10,
  },
  legendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

