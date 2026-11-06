import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Plus, ArrowLeftRight, Check, Trash2 } from 'lucide-react-native';
import { CategoryIcon } from '../components/CategoryIcon';
import { useExpenseStore } from '../store/useExpenseStore';
import { darkTheme, lightTheme } from '../constants/theme';
import { formatCurrency } from '../constants/currencies';
import { AccountType } from '../types';

interface WalletsScreenProps {
  onOpenTransfer: () => void;
}

export const WalletsScreen: React.FC<WalletsScreenProps> = ({ onOpenTransfer }) => {
  const {
    isDarkMode,
    accounts,
    currency,
    addAccount,
    deleteAccount,
  } = useExpenseStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [balanceStr, setBalanceStr] = useState('');
  const [type, setType] = useState<AccountType>('bank');

  const totalNetWorth = accounts.reduce((sum, a) => sum + a.balance, 0);

  const handleCreateAccount = () => {
    const balance = parseFloat(balanceStr) || 0;
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter an account name.');
      return;
    }

    const typeIcons: { [key in AccountType]: string } = {
      bank: 'Building2',
      savings: 'PiggyBank',
      credit: 'CreditCard',
      cash: 'Wallet',
      wallet: 'Smartphone',
    };

    const typeColors: { [key in AccountType]: string } = {
      bank: '#3B82F6',
      savings: '#10B981',
      credit: '#8B5CF6',
      cash: '#F59E0B',
      wallet: '#06B6D4',
    };

    addAccount({
      name: name.trim(),
      type,
      balance,
      currency,
      color: typeColors[type],
      icon: typeIcons[type],
    });

    setName('');
    setBalanceStr('');
    setShowAddModal(false);
  };

  const handleDelete = (id: string, accName: string) => {
    if (accounts.length <= 1) {
      Alert.alert('Action Denied', 'You must have at least one account.');
      return;
    }

    Alert.alert(
      'Delete Account',
      `Are you sure you want to delete "${accName}"? Associated transactions will also be removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteAccount(id) },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Total Net Worth Card */}
      <View style={[styles.netWorthCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.netWorthLabel, { color: theme.textMuted }]}>TOTAL NET WORTH</Text>
        <Text style={[styles.netWorthVal, { color: theme.text }]}>
          {formatCurrency(totalNetWorth, currency)}
        </Text>

        <TouchableOpacity
          style={[styles.transferBtn, { backgroundColor: theme.primary }]}
          onPress={onOpenTransfer}
        >
          <ArrowLeftRight size={16} color="#FFFFFF" />
          <Text style={styles.transferBtnText}>Transfer Between Accounts</Text>
        </TouchableOpacity>
      </View>

      {/* Account Cards Header */}
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>My Wallets & Accounts</Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: theme.surfaceSubtle }]}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={14} color={theme.primary} />
          <Text style={[styles.addBtnText, { color: theme.primary }]}>Add Account</Text>
        </TouchableOpacity>
      </View>

      {/* Account Cards */}
      {accounts.map((acc) => (
        <View
          key={acc.id}
          style={[styles.accountCard, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          <View style={styles.accountLeft}>
            <View style={[styles.accIconWrap, { backgroundColor: acc.color }]}>
              <CategoryIcon name={acc.icon} size={20} color="#FFFFFF" />
            </View>
            <View>
              <Text style={[styles.accountName, { color: theme.text }]}>{acc.name}</Text>
              <Text style={[styles.accountType, { color: theme.textMuted }]}>
                {acc.type.toUpperCase()}{acc.isDefault ? ' • DEFAULT' : ''}
              </Text>
            </View>
          </View>

          <View style={styles.accountRight}>
            <Text
              style={[
                styles.accountBalance,
                { color: acc.balance >= 0 ? theme.text : '#F43F5E' },
              ]}
            >
              {formatCurrency(acc.balance, currency)}
            </Text>
            {!acc.isDefault && (
              <TouchableOpacity
                onPress={() => handleDelete(acc.id, acc.name)}
                style={styles.deleteAccBtn}
              >
                <Trash2 size={14} color={theme.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}

      {/* Add Account Modal */}
      <Modal visible={showAddModal} transparent={true} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalBox, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Add New Account</Text>

            <TextInput
              style={[styles.input, { backgroundColor: theme.surfaceSubtle, color: theme.text }]}
              placeholder="Account Name (e.g. Chase Bank)"
              placeholderTextColor={theme.textMuted}
              value={name}
              onChangeText={setName}
            />

            <TextInput
              style={[styles.input, { backgroundColor: theme.surfaceSubtle, color: theme.text }]}
              keyboardType="decimal-pad"
              placeholder="Initial Balance (e.g. 500.00)"
              placeholderTextColor={theme.textMuted}
              value={balanceStr}
              onChangeText={setBalanceStr}
            />

            {/* Account Type Selector */}
            <View style={styles.typeSelectorRow}>
              {(['bank', 'credit', 'cash', 'savings', 'wallet'] as AccountType[]).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.typePill,
                    type === t
                      ? { backgroundColor: theme.primary }
                      : { backgroundColor: theme.surfaceSubtle },
                  ]}
                  onPress={() => setType(t)}
                >
                  <Text
                    style={[
                      styles.typePillText,
                      { color: type === t ? '#FFFFFF' : theme.textSecondary },
                    ]}
                  >
                    {t.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.cancelBtn, { backgroundColor: theme.surfaceSubtle }]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={{ color: theme.textSecondary, fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: theme.primary }]}
                onPress={handleCreateAccount}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  netWorthCard: {
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    gap: 10,
    alignItems: 'center',
  },
  netWorthLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  netWorthVal: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
  },
  transferBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 6,
  },
  transferBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  accountCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  accountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  accIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountName: {
    fontSize: 16,
    fontWeight: '700',
  },
  accountType: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  accountRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  accountBalance: {
    fontSize: 16,
    fontWeight: '800',
  },
  deleteAccBtn: {
    padding: 2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalBox: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    padding: 20,
    gap: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 14,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  typePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  typePillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
});

