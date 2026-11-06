import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { X, Check, ArrowLeftRight, Repeat } from 'lucide-react-native';
import { CategoryIcon } from './CategoryIcon';
import { TransactionType } from '../types';
import { useExpenseStore } from '../store/useExpenseStore';
import { darkTheme, lightTheme } from '../constants/theme';
import { CURRENCIES } from '../constants/currencies';

interface AddTransactionModalProps {
  visible: boolean;
  initialType?: TransactionType;
  onClose: () => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  visible,
  initialType = 'expense',
  onClose,
}) => {
  const {
    isDarkMode,
    categories,
    accounts,
    currency,
    addTransaction,
    transferFunds,
  } = useExpenseStore();

  const theme = isDarkMode ? darkTheme : lightTheme;
  const currentCurrency = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];

  const [type, setType] = useState<TransactionType>(initialType);
  const [amountStr, setAmountStr] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    categories.find((c) => c.type === (initialType === 'income' ? 'income' : 'expense'))?.id || categories[0].id
  );
  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts.find((a) => a.isDefault)?.id || accounts[0]?.id || ''
  );
  const [selectedToAccountId, setSelectedToAccountId] = useState(
    accounts.length > 1 ? accounts[1].id : ''
  );
  const [note, setNote] = useState('');
  const [isSubscription, setIsSubscription] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredCategories = categories.filter((c) => c.type === (type === 'income' ? 'income' : 'expense'));

  const handleSave = () => {
    const numAmount = parseFloat(amountStr);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid numeric amount greater than 0.');
      return;
    }

    if (type === 'transfer') {
      if (!selectedAccountId || !selectedToAccountId || selectedAccountId === selectedToAccountId) {
        Alert.alert('Invalid Accounts', 'Please select two different accounts for transfer.');
        return;
      }
      transferFunds(selectedAccountId, selectedToAccountId, numAmount, note || 'Account Transfer');
    } else {
      addTransaction({
        type,
        amount: numAmount,
        categoryId: selectedCategoryId,
        accountId: selectedAccountId,
        date,
        note: note.trim(),
        isSubscription: isSubscription && type === 'expense',
        recurringInterval: isSubscription ? 'monthly' : undefined,
      });
    }

    // Reset & Close
    setAmountStr('');
    setNote('');
    setIsSubscription(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={[styles.modalSheet, { backgroundColor: theme.surface }]}>
          {/* Header */}
          <View style={[styles.headerRow, { borderBottomColor: theme.border }]}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={theme.textMuted} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Add Transaction</Text>
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.saveBtn, { backgroundColor: theme.primary }]}
            >
              <Check size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Type Selector (Expense / Income / Transfer) */}
            <View style={[styles.typeSelector, { backgroundColor: theme.surfaceSubtle }]}>
              <TouchableOpacity
                style={[
                  styles.typeTab,
                  type === 'expense' && { backgroundColor: '#F43F5E' },
                ]}
                onPress={() => {
                  setType('expense');
                  const firstExp = categories.find((c) => c.type === 'expense');
                  if (firstExp) setSelectedCategoryId(firstExp.id);
                }}
              >
                <Text
                  style={[
                    styles.typeTabText,
                    { color: type === 'expense' ? '#FFFFFF' : theme.textSecondary },
                  ]}
                >
                  Expense
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeTab,
                  type === 'income' && { backgroundColor: '#10B981' },
                ]}
                onPress={() => {
                  setType('income');
                  const firstInc = categories.find((c) => c.type === 'income');
                  if (firstInc) setSelectedCategoryId(firstInc.id);
                }}
              >
                <Text
                  style={[
                    styles.typeTabText,
                    { color: type === 'income' ? '#FFFFFF' : theme.textSecondary },
                  ]}
                >
                  Income
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeTab,
                  type === 'transfer' && { backgroundColor: '#6366F1' },
                ]}
                onPress={() => setType('transfer')}
              >
                <Text
                  style={[
                    styles.typeTabText,
                    { color: type === 'transfer' ? '#FFFFFF' : theme.textSecondary },
                  ]}
                >
                  Transfer
                </Text>
              </TouchableOpacity>
            </View>

            {/* Amount Input */}
            <View style={styles.amountContainer}>
              <Text style={[styles.currencyPrefix, { color: theme.textSecondary }]}>
                {currentCurrency.symbol}
              </Text>
              <TextInput
                style={[styles.amountInput, { color: theme.text }]}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={theme.textMuted}
                value={amountStr}
                onChangeText={setAmountStr}
                autoFocus={true}
              />
            </View>

            {/* Category Selector (For Expense & Income) */}
            {type !== 'transfer' && (
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                  SELECT CATEGORY
                </Text>
                <View style={styles.categoryGrid}>
                  {filteredCategories.map((cat) => {
                    const isSelected = selectedCategoryId === cat.id;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.categoryPill,
                          {
                            backgroundColor: isSelected ? cat.color : theme.surfaceSubtle,
                            borderColor: isSelected ? cat.color : theme.border,
                          },
                        ]}
                        onPress={() => setSelectedCategoryId(cat.id)}
                      >
                        <CategoryIcon
                          name={cat.icon}
                          size={16}
                          color={isSelected ? '#FFFFFF' : cat.color}
                        />
                        <Text
                          style={[
                            styles.categoryName,
                            { color: isSelected ? '#FFFFFF' : theme.text },
                          ]}
                          numberOfLines={1}
                        >
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Account Selector */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                {type === 'transfer' ? 'FROM ACCOUNT' : 'PAYMENT ACCOUNT'}
              </Text>
              <View style={styles.accountRow}>
                {accounts.map((acc) => {
                  const isSelected = selectedAccountId === acc.id;
                  return (
                    <TouchableOpacity
                      key={acc.id}
                      style={[
                        styles.accountPill,
                        {
                          backgroundColor: isSelected ? theme.primary : theme.surfaceSubtle,
                        },
                      ]}
                      onPress={() => setSelectedAccountId(acc.id)}
                    >
                      <Text
                        style={[
                          styles.accountName,
                          { color: isSelected ? '#FFFFFF' : theme.text },
                        ]}
                      >
                        {acc.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Transfer Destination Account */}
            {type === 'transfer' && (
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                  TO ACCOUNT
                </Text>
                <View style={styles.accountRow}>
                  {accounts.map((acc) => {
                    const isSelected = selectedToAccountId === acc.id;
                    return (
                      <TouchableOpacity
                        key={acc.id}
                        style={[
                          styles.accountPill,
                          {
                            backgroundColor: isSelected ? '#6366F1' : theme.surfaceSubtle,
                          },
                        ]}
                        onPress={() => setSelectedToAccountId(acc.id)}
                      >
                        <Text
                          style={[
                            styles.accountName,
                            { color: isSelected ? '#FFFFFF' : theme.text },
                          ]}
                        >
                          {acc.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Description / Note */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                DESCRIPTION / NOTE
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: theme.surfaceSubtle, color: theme.text, borderColor: theme.border },
                ]}
                placeholder="What was this for? (e.g., Starbucks Coffee)"
                placeholderTextColor={theme.textMuted}
                value={note}
                onChangeText={setNote}
              />
            </View>

            {/* Date Input */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                DATE (YYYY-MM-DD)
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: theme.surfaceSubtle, color: theme.text, borderColor: theme.border },
                ]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.textMuted}
                value={date}
                onChangeText={setDate}
              />
            </View>

            {/* Subscription Toggle */}
            {type === 'expense' && (
              <TouchableOpacity
                style={[styles.subscriptionRow, { backgroundColor: theme.surfaceSubtle }]}
                onPress={() => setIsSubscription(!isSubscription)}
                activeOpacity={0.7}
              >
                <View style={styles.subLeft}>
                  <Repeat size={18} color={isSubscription ? theme.primary : theme.textMuted} />
                  <View>
                    <Text style={[styles.subTitle, { color: theme.text }]}>
                      Recurring Subscription
                    </Text>
                    <Text style={[styles.subSub, { color: theme.textMuted }]}>
                      Repeats monthly (Netflix, Gym, Rent)
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.toggleTrack,
                    { backgroundColor: isSubscription ? theme.primary : theme.surfaceHighlight },
                  ]}
                >
                  <View
                    style={[
                      styles.toggleThumb,
                      { transform: [{ translateX: isSubscription ? 18 : 0 }] },
                    ]}
                  />
                </View>
              </TouchableOpacity>
            )}

            {/* Bottom Save Action */}
            <TouchableOpacity
              style={[styles.fullSaveBtn, { backgroundColor: theme.primary }]}
              onPress={handleSave}
            >
              <Text style={styles.fullSaveBtnText}>Save Transaction</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 16,
    maxHeight: '90%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  closeBtn: {
    padding: 6,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  saveBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    gap: 18,
    paddingBottom: 40,
  },
  typeSelector: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
  },
  typeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  typeTabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  currencyPrefix: {
    fontSize: 32,
    fontWeight: '800',
    marginRight: 6,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '900',
    minWidth: 120,
    textAlign: 'center',
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
  },
  accountRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  accountPill: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
  },
  accountName: {
    fontSize: 13,
    fontWeight: '600',
  },
  textInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    fontSize: 14,
    borderWidth: 1,
  },
  subscriptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
  },
  subLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  subSub: {
    fontSize: 11,
    marginTop: 1,
  },
  toggleTrack: {
    width: 44,
    height: 26,
    borderRadius: 13,
    padding: 3,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  fullSaveBtn: {
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  fullSaveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
