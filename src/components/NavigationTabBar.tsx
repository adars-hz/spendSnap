import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Home, PieChart, Camera, Target, Wallet } from 'lucide-react-native';
import { TabType } from '../types';
import { darkTheme, lightTheme } from '../constants/theme';
import { useExpenseStore } from '../store/useExpenseStore';

interface NavigationTabBarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onSnapPress: () => void;
}

export const NavigationTabBar: React.FC<NavigationTabBarProps> = ({
  currentTab,
  onSelectTab,
  onSnapPress,
}) => {
  const { isDarkMode } = useExpenseStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <View style={[styles.container, { backgroundColor: theme.navBar, borderTopColor: theme.border }]}>
      {/* Home Tab */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => onSelectTab('home')}
        activeOpacity={0.7}
      >
        <Home
          size={22}
          color={currentTab === 'home' ? theme.primary : theme.textMuted}
        />
        <Text
          style={[
            styles.tabLabel,
            { color: currentTab === 'home' ? theme.primary : theme.textMuted },
          ]}
        >
          Home
        </Text>
      </TouchableOpacity>

      {/* Analytics Tab */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => onSelectTab('analytics')}
        activeOpacity={0.7}
      >
        <PieChart
          size={22}
          color={currentTab === 'analytics' ? theme.primary : theme.textMuted}
        />
        <Text
          style={[
            styles.tabLabel,
            { color: currentTab === 'analytics' ? theme.primary : theme.textMuted },
          ]}
        >
          Insights
        </Text>
      </TouchableOpacity>

      {/* Central "Snap" Button */}
      <View style={styles.centerBtnWrapper}>
        <TouchableOpacity
          style={[styles.snapButton, { backgroundColor: theme.primary }]}
          onPress={onSnapPress}
          activeOpacity={0.85}
        >
          <Camera size={26} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Budgets & Goals Tab */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => onSelectTab('budgets')}
        activeOpacity={0.7}
      >
        <Target
          size={22}
          color={currentTab === 'budgets' ? theme.primary : theme.textMuted}
        />
        <Text
          style={[
            styles.tabLabel,
            { color: currentTab === 'budgets' ? theme.primary : theme.textMuted },
          ]}
        >
          Budgets
        </Text>
      </TouchableOpacity>

      {/* Wallets & Accounts Tab */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => onSelectTab('wallets')}
        activeOpacity={0.7}
      >
        <Wallet
          size={22}
          color={currentTab === 'wallets' ? theme.primary : theme.textMuted}
        />
        <Text
          style={[
            styles.tabLabel,
            { color: currentTab === 'wallets' ? theme.primary : theme.textMuted },
          ]}
        >
          Wallets
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: Platform.OS === 'ios' ? 84 : 68,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    borderTopWidth: 1,
    position: 'relative',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  centerBtnWrapper: {
    position: 'relative',
    top: -18,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  snapButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#090D16',
  },
});
