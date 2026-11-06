import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import {
  Sun,
  Moon,
  Coins,
  FileSpreadsheet,
  FileText,
  Trash2,
  ChevronRight,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react-native';
import { useExpenseStore } from '../store/useExpenseStore';
import { darkTheme, lightTheme } from '../constants/theme';
import { CURRENCIES } from '../constants/currencies';
import { exportTransactionsToCsv, exportTransactionsToPdf } from '../services/exportService';

interface SettingsScreenProps {
  visible: boolean;
  onClose: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ visible, onClose }) => {
  const {
    isDarkMode,
    toggleTheme,
    currency,
    setCurrency,
    transactions,
    categories,
    accounts,
    resetAllData,
  } = useExpenseStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const activeCurrency = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];

  const handleExportCsv = async () => {
    setIsExporting(true);
    const res = await exportTransactionsToCsv(transactions, categories, accounts, currency);
    setIsExporting(false);
    Alert.alert(res.success ? 'Export Complete' : 'Export Failed', res.message);
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    const res = await exportTransactionsToPdf(transactions, categories, accounts, currency);
    setIsExporting(false);
    Alert.alert(res.success ? 'PDF Generated' : 'PDF Failed', res.message);
  };

  const handleReset = () => {
    Alert.alert(
      'Reset All Data',
      'This will erase all your transactions, custom wallets, and goals. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: () => {
            resetAllData();
            Alert.alert('Reset Complete', 'All data has been cleared.');
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.headerRow, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.text }]}>Settings & Tools</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={22} color={theme.text} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* General Preferences */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>PREFERENCES</Text>

            {/* Currency */}
            <TouchableOpacity
              style={[styles.rowItem, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => setShowCurrencyModal(true)}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.iconWrap, { backgroundColor: '#EEF2FF' }]}>
                  <Coins size={18} color="#6366F1" />
                </View>
                <View>
                  <Text style={[styles.rowTitle, { color: theme.text }]}>Default Currency</Text>
                  <Text style={[styles.rowSub, { color: theme.textMuted }]}>
                    {activeCurrency.name} ({activeCurrency.symbol})
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color={theme.textMuted} />
            </TouchableOpacity>

            {/* Theme Toggle */}
            <TouchableOpacity
              style={[styles.rowItem, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={toggleTheme}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.iconWrap, { backgroundColor: '#FEF3C7' }]}>
                  {isDarkMode ? (
                    <Sun size={18} color="#D97706" />
                  ) : (
                    <Moon size={18} color="#D97706" />
                  )}
                </View>
                <View>
                  <Text style={[styles.rowTitle, { color: theme.text }]}>Theme Mode</Text>
                  <Text style={[styles.rowSub, { color: theme.textMuted }]}>
                    Currently {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                  </Text>
                </View>
              </View>
              <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 13 }}>Toggle</Text>
            </TouchableOpacity>
          </View>

          {/* Data Export Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>DATA EXPORT</Text>

            <TouchableOpacity
              style={[styles.rowItem, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={handleExportCsv}
              disabled={isExporting}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.iconWrap, { backgroundColor: '#DCFCE7' }]}>
                  <FileSpreadsheet size={18} color="#16A34A" />
                </View>
                <View>
                  <Text style={[styles.rowTitle, { color: theme.text }]}>Export to CSV</Text>
                  <Text style={[styles.rowSub, { color: theme.textMuted }]}>
                    Download Excel/Spreadsheet report
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color={theme.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.rowItem, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={handleExportPdf}
              disabled={isExporting}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.iconWrap, { backgroundColor: '#FFE4E6' }]}>
                  <FileText size={18} color="#E11D48" />
                </View>
                <View>
                  <Text style={[styles.rowTitle, { color: theme.text }]}>Export Statement PDF</Text>
                  <Text style={[styles.rowSub, { color: theme.textMuted }]}>
                    Formatted document with monthly breakdown
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Data Management Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>DATA MANAGEMENT</Text>

            <TouchableOpacity
              style={[styles.rowItem, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={handleReset}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.iconWrap, { backgroundColor: 'rgba(244, 63, 94, 0.15)' }]}>
                  <Trash2 size={18} color="#F43F5E" />
                </View>
                <View>
                  <Text style={[styles.rowTitle, { color: '#F43F5E' }]}>Clear All Data</Text>
                  <Text style={[styles.rowSub, { color: theme.textMuted }]}>
                    Wipe local storage and start fresh
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Privacy Note */}
          <View style={[styles.privacyBox, { backgroundColor: theme.surfaceSubtle }]}>
            <ShieldCheck size={20} color={theme.primary} />
            <Text style={[styles.privacyText, { color: theme.textSecondary }]}>
              SpendSnap is 100% offline-first. Your financial details and scanned receipts never leave your device.
            </Text>
          </View>
        </ScrollView>

        {/* Currency Picker Modal */}
        <Modal visible={showCurrencyModal} transparent={true} animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={[styles.currencyBox, { backgroundColor: theme.surface }]}>
              <Text style={[styles.currencyBoxTitle, { color: theme.text }]}>Select Currency</Text>
              <ScrollView style={{ maxHeight: 300 }}>
                {CURRENCIES.map((c) => {
                  const isSelected = c.code === currency;
                  return (
                    <TouchableOpacity
                      key={c.code}
                      style={[
                        styles.currencyItem,
                        { borderBottomColor: theme.border },
                        isSelected && { backgroundColor: theme.surfaceSubtle },
                      ]}
                      onPress={() => {
                        setCurrency(c.code);
                        setShowCurrencyModal(false);
                      }}
                    >
                      <Text style={[styles.currencyItemText, { color: theme.text }]}>
                        {c.name} ({c.symbol} - {c.code})
                      </Text>
                      {isSelected && <Check size={18} color={theme.primary} />}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <TouchableOpacity
                style={[styles.currencyCloseBtn, { backgroundColor: theme.surfaceSubtle }]}
                onPress={() => setShowCurrencyModal(false)}
              >
                <Text style={{ color: theme.text, fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 6,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 22,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  rowSub: {
    fontSize: 12,
    marginTop: 2,
  },
  privacyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    marginTop: 10,
  },
  privacyText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  currencyBox: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 20,
    padding: 18,
    gap: 12,
  },
  currencyBoxTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  currencyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  currencyItemText: {
    fontSize: 14,
    fontWeight: '600',
  },
  currencyCloseBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
  },
});

