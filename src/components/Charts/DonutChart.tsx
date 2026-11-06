import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { G, Path, Circle } from 'react-native-svg';
import { Category } from '../../types';
import { darkTheme, lightTheme } from '../../constants/theme';
import { useExpenseStore } from '../../store/useExpenseStore';
import { formatCurrency } from '../../constants/currencies';

interface Slice {
  category: Category;
  amount: number;
  percentage: number;
  color: string;
}

interface DonutChartProps {
  data: { categoryId: string; amount: number }[];
  totalAmount: number;
  size?: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  totalAmount,
  size = 200,
}) => {
  const { isDarkMode, categories, currency } = useExpenseStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  // Prepare slices
  const slices: Slice[] = data
    .filter((d) => d.amount > 0)
    .map((d) => {
      const category = categories.find((c) => c.id === d.categoryId) || {
        id: d.categoryId,
        name: 'Other',
        icon: 'HelpCircle',
        color: '#9CA3AF',
        type: 'expense' as const,
      };
      return {
        category,
        amount: d.amount,
        percentage: totalAmount > 0 ? (d.amount / totalAmount) * 100 : 0,
        color: category.color,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // SVG arc calculation helper
  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  let cumulativePercent = 0;

  return (
    <View style={styles.container}>
      <View style={[styles.svgWrapper, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          <G transform={`translate(${center}, ${center}) rotate(-90)`}>
            {slices.length === 0 ? (
              <Circle
                cx={0}
                cy={0}
                r={radius}
                stroke={theme.surfaceSubtle}
                strokeWidth={strokeWidth}
                fill="none"
              />
            ) : (
              slices.map((slice, index) => {
                const percent = slice.amount / totalAmount;
                const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
                cumulativePercent += percent;
                const [endX, endY] = getCoordinatesForPercent(cumulativePercent);

                const largeArcFlag = percent > 0.5 ? 1 : 0;
                const pathData = [
                  `M ${startX * radius} ${startY * radius}`,
                  `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX * radius} ${endY * radius}`,
                ].join(' ');

                return (
                  <Path
                    key={slice.category.id + index}
                    d={pathData}
                    fill="none"
                    stroke={slice.color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                  />
                );
              })
            )}
          </G>
        </Svg>

        <View style={styles.centerLabel}>
          <Text style={[styles.totalLabel, { color: theme.textMuted }]}>TOTAL</Text>
          <Text style={[styles.totalValue, { color: theme.text }]} numberOfLines={1}>
            {formatCurrency(totalAmount, currency)}
          </Text>
        </View>
      </View>

      {/* Legend list */}
      <View style={styles.legendContainer}>
        {slices.slice(0, 5).map((slice) => (
          <View key={slice.category.id} style={styles.legendItem}>
            <View style={styles.legendLeft}>
              <View style={[styles.colorDot, { backgroundColor: slice.color }]} />
              <Text style={[styles.legendName, { color: theme.text }]} numberOfLines={1}>
                {slice.category.name}
              </Text>
            </View>
            <View style={styles.legendRight}>
              <Text style={[styles.legendAmount, { color: theme.text }]}>
                {formatCurrency(slice.amount, currency)}
              </Text>
              <Text style={[styles.legendPct, { color: theme.textMuted }]}>
                {slice.percentage.toFixed(0)}%
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 12,
  },
  svgWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
    textAlign: 'center',
  },
  legendContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 10,
  },
  legendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendName: {
    fontSize: 13,
    fontWeight: '600',
  },
  legendRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendAmount: {
    fontSize: 13,
    fontWeight: '700',
  },
  legendPct: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 32,
    textAlign: 'right',
  },
});

