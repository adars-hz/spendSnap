import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Moon, Sun, Camera, SlidersHorizontal } from 'lucide-react-native';
import { useExpenseStore } from '../store/useExpenseStore';
import { darkTheme, lightTheme } from '../constants/theme';

interface HeaderProps {
  onOpenSettings?: () => void;
  onOpenSnapModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings, onOpenSnapModal }) => {
  const { isDarkMode, toggleTheme, accounts, filterAccountId, setFilterAccount } = useExpenseStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const activeAccount = accounts.find((a) => a.id === filterAccountId);

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
      <View style={styles.leftRow}>
        <View style={[styles.logoIcon, { backgroundColor: theme.primary }]}>
          <Camera size={18} color="#FFFFFF" />
        </View>
        <View>
          <Text style={[styles.brandText, { color: theme.text }]}>SpendSnap</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              // Cycle through accounts or reset to All
              if (!filterAccountId) {
                if (accounts.length > 0) setFilterAccount(accounts[0].id);
              } else {
                const currentIndex = accounts.findIndex((a) => a.id === filterAccountId);
                if (currentIndex < accounts.length - 1) {
                  setFilterAccount(accounts[currentIndex + 1].id);
                } else {
                  setFilterAccount(null);
                }
              }
            }}
          >
            <Text style={[styles.accountBadgeText, { color: theme.primary }]}>
              {activeAccount ? activeAccount.name : 'All Accounts'} ▾
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.rightActions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.surfaceSubtle }]}
          onPress={toggleTheme}
          activeOpacity={0.7}
        >
          {isDarkMode ? (
            <Sun size={18} color={theme.textSecondary} />
          ) : (
            <Moon size={18} color={theme.textSecondary} />
          )}
        </TouchableOpacity>

        {onOpenSettings && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.surfaceSubtle }]}
            onPress={onOpenSettings}
            activeOpacity={0.7}
          >
            <SlidersHorizontal size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 54 : 42,
    paddingBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  accountBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

