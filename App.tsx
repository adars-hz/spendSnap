import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useExpenseStore } from './src/store/useExpenseStore';
import { darkTheme, lightTheme } from './src/constants/theme';
import { TabType, TransactionType } from './src/types';
import { Header } from './src/components/Header';
import { NavigationTabBar } from './src/components/NavigationTabBar';
import { AddTransactionModal } from './src/components/AddTransactionModal';
import { ReceiptScanModal } from './src/components/ReceiptScanModal';
import { HomeScreen } from './src/screens/HomeScreen';
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';
import { BudgetsScreen } from './src/screens/BudgetsScreen';
import { WalletsScreen } from './src/screens/WalletsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

export default function App() {
  const { isDarkMode } = useExpenseStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [showAddTxModal, setShowAddTxModal] = useState(false);
  const [addTxType, setAddTxType] = useState<TransactionType>('expense');
  const [showSnapModal, setShowSnapModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const handleOpenAddModal = (type: TransactionType = 'expense') => {
    setAddTxType(type);
    setShowAddTxModal(true);
  };

  const renderActiveScreen = () => {
    switch (currentTab) {
      case 'home':
        return (
          <HomeScreen
            onAddTransaction={handleOpenAddModal}
            onSnapReceipt={() => setShowSnapModal(true)}
          />
        );
      case 'analytics':
        return <AnalyticsScreen />;
      case 'budgets':
        return <BudgetsScreen />;
      case 'wallets':
        return (
          <WalletsScreen
            onOpenTransfer={() => handleOpenAddModal('transfer')}
          />
        );
      default:
        return (
          <HomeScreen
            onAddTransaction={handleOpenAddModal}
            onSnapReceipt={() => setShowSnapModal(true)}
          />
        );
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.surface }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* App Header */}
        <Header
          onOpenSettings={() => setShowSettingsModal(true)}
          onOpenSnapModal={() => setShowSnapModal(true)}
        />

        {/* Screen Content */}
        <View style={styles.screenContent}>{renderActiveScreen()}</View>

        {/* Floating Navigation Tab Bar */}
        <NavigationTabBar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onSnapPress={() => setShowSnapModal(true)}
        />

        {/* Add Transaction Modal */}
        <AddTransactionModal
          visible={showAddTxModal}
          initialType={addTxType}
          onClose={() => setShowAddTxModal(false)}
        />

        {/* SpendSnap AI Receipt Scanner Modal */}
        <ReceiptScanModal
          visible={showSnapModal}
          onClose={() => setShowSnapModal(false)}
        />

        {/* Settings & Tools Screen Modal */}
        <SettingsScreen
          visible={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  screenContent: {
    flex: 1,
  },
});
