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
import { Target, Repeat, PiggyBank, Plus, Edit2, AlertTriangle } from 'lucide-react-native';
import { CategoryIcon } from '../components/CategoryIcon';
import { useExpenseStore } from '../store/useExpenseStore';
import { darkTheme, lightTheme } from '../constants/theme';
import { formatCurrency } from '../constants/currencies';

export const BudgetsScreen: React.FC = () => {
  const {
    isDarkMode,
    categories,
    transactions,
    currency,
    goals,
    updateCategoryBudget,
    addGoal,
    updateGoalProgress,
  } = useExpenseStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  // Edit budget modal state
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editLimitStr, setEditLimitStr] = useState('');

  // Add goal modal state
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalTargetStr, setGoalTargetStr] = useState('');

  // Current month prefix for calculating actual spent
  const now = new Date();
  const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const currentMonthExpenses = transactions.filter(
    (t) => t.type === 'expense' && t.date.startsWith(currentMonthPrefix)
  );

  // Group spent by category
  const categorySpentMap: { [catId: string]: number } = {};
  currentMonthExpenses.forEach((t) => {
    categorySpentMap[t.categoryId] = (categorySpentMap[t.categoryId] || 0) + t.amount;
  });

  // Calculate subscriptions
  const subscriptionTxs = transactions.filter((t) => t.isSubscription);
  const totalMonthlySubscriptions = subscriptionTxs.reduce((sum, t) => sum + t.amount, 0);

  // Handle edit budget save
  const handleSaveBudget = () => {
    if (!editingCategoryId) return;
    const limit = parseFloat(editLimitStr);
    if (!isNaN(limit) && limit >= 0) {
      updateCategoryBudget(editingCategoryId, limit);
    }
    setEditingCategoryId(null);
    setEditLimitStr('');
  };

  // Handle new goal save
  const handleSaveGoal = () => {
    const target = parseFloat(goalTargetStr);
    if (!goalName.trim() || isNaN(target) || target <= 0) {
      Alert.alert('Invalid Goal', 'Please enter a valid goal name and target amount.');
      return;
    }

    addGoal({
      name: goalName.trim(),
      targetAmount: target,
      currentAmount: 0,
      icon: 'PiggyBank',
      color: '#10B981',
    });

    setGoalName('');
    setGoalTargetStr('');
    setShowAddGoalModal(false);
  };

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const budgetedCategories = expenseCategories.filter((c) => (c.budgetLimit || 0) > 0);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Subscriptions Overview Card */}
      <View style={[styles.subscriptionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.subCardHeader}>
          <View style={styles.subCardLeft}>
            <View style={[styles.subIconWrapper, { backgroundColor: '#EEF2FF' }]}>
              <Repeat size={18} color="#6366F1" />
            </View>
            <View>
              <Text style={[styles.subCardTitle, { color: theme.text }]}>
                Active Subscriptions
              </Text>
              <Text style={[styles.subCardSub, { color: theme.textMuted }]}>
                {subscriptionTxs.length > 0
                  ? `${subscriptionTxs.length} recurring services`
                  : 'No recurring bills logged yet'}
              </Text>
            </View>
          </View>
          <Text style={[styles.subCardTotal, { color: '#6366F1' }]}>
            {formatCurrency(totalMonthlySubscriptions, currency)}/mo
          </Text>
        </View>

        {subscriptionTxs.length > 0 ? (
          subscriptionTxs.map((sub) => (
            <View key={sub.id} style={[styles.subItemRow, { borderTopColor: theme.border }]}>
              <Text style={[styles.subItemName, { color: theme.text }]}>{sub.note}</Text>
              <Text style={[styles.subItemAmount, { color: theme.textSecondary }]}>
                {formatCurrency(sub.amount, currency)}
              </Text>
            </View>
          ))
        ) : (
          <Text style={[styles.emptyHintText, { color: theme.textMuted }]}>
            Toggle &quot;Recurring Subscription&quot; when adding an expense to track services like Netflix, Gym, or Rent.
          </Text>
        )}
      </View>

      {/* Category Budgets Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Category Budgets</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>Monthly Caps</Text>
        </View>

        {budgetedCategories.length > 0 ? (
          budgetedCategories.map((cat) => {
            const spent = categorySpentMap[cat.id] || 0;
            const limit = cat.budgetLimit || 1;
            const percentage = Math.min(Math.round((spent / limit) * 100), 100);
            const isOverBudget = spent > limit;
            const isNearLimit = spent / limit >= 0.8 && !isOverBudget;

            const progressColor = isOverBudget
              ? '#F43F5E'
              : isNearLimit
              ? '#F59E0B'
              : theme.primary;

            return (
              <View
                key={cat.id}
                style={[styles.budgetCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <View style={styles.budgetTopRow}>
                  <View style={styles.budgetCatInfo}>
                    <View style={[styles.catIconWrap, { backgroundColor: cat.color }]}>
                      <CategoryIcon name={cat.icon} size={16} color="#FFFFFF" />
                    </View>
                    <Text style={[styles.budgetName, { color: theme.text }]}>{cat.name}</Text>
                  </View>

                  <View style={styles.budgetActions}>
                    <TouchableOpacity
                      onPress={() => {
                        setEditingCategoryId(cat.id);
                        setEditLimitStr(limit.toString());
                      }}
                      style={styles.editBtn}
                    >
                      <Edit2 size={14} color={theme.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Amount Row */}
                <View style={styles.budgetNumbersRow}>
                  <Text style={[styles.spentText, { color: theme.text }]}>
                    {formatCurrency(spent, currency)}{' '}
                    <Text style={{ color: theme.textMuted, fontSize: 12, fontWeight: 'normal' }}>
                      of {formatCurrency(limit, currency)}
                    </Text>
                  </Text>
                  <Text style={[styles.pctText, { color: progressColor }]}>{percentage}%</Text>
                </View>

                {/* Progress Bar */}
                <View style={[styles.progressTrack, { backgroundColor: theme.surfaceSubtle }]}>
                  <View
                    style={[
                      styles.progressBar,
                      { width: `${percentage}%`, backgroundColor: progressColor },
                    ]}
                  />
                </View>

                {/* Warning Alert if over limit */}
                {isOverBudget && (
                  <View style={styles.alertRow}>
                    <AlertTriangle size={12} color="#F43F5E" />
                    <Text style={styles.alertText}>
                      Over budget by {formatCurrency(spent - limit, currency)}
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        ) : null}

        {/* Set Budget on Any Category Pill Row */}
        <View style={[styles.setupBudgetBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.setupBudgetTitle, { color: theme.text }]}>
            {budgetedCategories.length === 0
              ? 'Set Monthly Spending Caps'
              : 'Add Another Budget Cap'}
          </Text>
          <Text style={[styles.setupBudgetSub, { color: theme.textMuted }]}>
            Select a category to set its monthly budget:
          </Text>
          <View style={styles.catChipsGrid}>
            {expenseCategories
              .filter((c) => !c.budgetLimit || c.budgetLimit <= 0)
              .map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.catChip, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}
                  onPress={() => {
                    setEditingCategoryId(cat.id);
                    setEditLimitStr('300');
                  }}
                >
                  <CategoryIcon name={cat.icon} size={14} color={cat.color} />
                  <Text style={[styles.catChipText, { color: theme.text }]}>+ {cat.name}</Text>
                </TouchableOpacity>
              ))}
          </View>
        </View>
      </View>

      {/* Savings Goals Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Savings Goals</Text>
          <TouchableOpacity
            style={[styles.addGoalBtn, { backgroundColor: theme.surfaceSubtle }]}
            onPress={() => setShowAddGoalModal(true)}
          >
            <Plus size={14} color={theme.primary} />
            <Text style={[styles.addGoalBtnText, { color: theme.primary }]}>New Goal</Text>
          </TouchableOpacity>
        </View>

        {goals.length > 0 ? (
          goals.map((goal) => {
            const pct = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);

            return (
              <View
                key={goal.id}
                style={[styles.goalCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <View style={styles.goalTopRow}>
                  <View style={styles.goalLeft}>
                    <View style={[styles.goalIconWrap, { backgroundColor: goal.color }]}>
                      <CategoryIcon name={goal.icon} size={18} color="#FFFFFF" />
                    </View>
                    <View>
                      <Text style={[styles.goalName, { color: theme.text }]}>{goal.name}</Text>
                      <Text style={[styles.goalTarget, { color: theme.textMuted }]}>
                        Target: {formatCurrency(goal.targetAmount, currency)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.goalBoostBtns}>
                    <TouchableOpacity
                      style={[styles.boostBtn, { backgroundColor: theme.surfaceSubtle }]}
                      onPress={() => updateGoalProgress(goal.id, 50)}
                    >
                      <Text style={[styles.boostBtnText, { color: theme.primary }]}>+$50</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.boostBtn, { backgroundColor: theme.surfaceSubtle }]}
                      onPress={() => updateGoalProgress(goal.id, 100)}
                    >
                      <Text style={[styles.boostBtnText, { color: theme.primary }]}>+$100</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Goal Progress bar */}
                <View style={styles.goalProgressWrap}>
                  <View style={[styles.progressTrack, { backgroundColor: theme.surfaceSubtle }]}>
                    <View
                      style={[
                        styles.progressBar,
                        { width: `${pct}%`, backgroundColor: goal.color },
                      ]}
                    />
                  </View>
                  <View style={styles.goalProgressLabels}>
                    <Text style={[styles.goalSavedLabel, { color: theme.text }]}>
                      {formatCurrency(goal.currentAmount, currency)} saved
                    </Text>
                    <Text style={[styles.goalPctLabel, { color: goal.color }]}>{pct}%</Text>
                  </View>
                </View>
              </View>
            );
          })
        ) : (
          <TouchableOpacity
            style={[styles.emptyGoalCard, { backgroundColor: theme.surfaceSubtle }]}
            onPress={() => setShowAddGoalModal(true)}
            activeOpacity={0.7}
          >
            <PiggyBank size={32} color={theme.primary} />
            <Text style={[styles.emptyGoalTitle, { color: theme.text }]}>No Savings Goals Yet</Text>
            <Text style={[styles.emptyGoalSub, { color: theme.textMuted }]}>
              Set up targets like Emergency Fund, Vacation, or New Gadget.
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Edit Budget Modal */}
      <Modal visible={!!editingCategoryId} transparent={true} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalBox, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalBoxTitle, { color: theme.text }]}>Set Category Budget</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.surfaceSubtle, color: theme.text }]}
              keyboardType="decimal-pad"
              placeholder="e.g. 500"
              placeholderTextColor={theme.textMuted}
              value={editLimitStr}
              onChangeText={setEditLimitStr}
              autoFocus={true}
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { backgroundColor: theme.surfaceSubtle }]}
                onPress={() => setEditingCategoryId(null)}
              >
                <Text style={{ color: theme.textSecondary, fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmBtn, { backgroundColor: theme.primary }]}
                onPress={handleSaveBudget}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Save Cap</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Goal Modal */}
      <Modal visible={showAddGoalModal} transparent={true} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalBox, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalBoxTitle, { color: theme.text }]}>Create Savings Goal</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.surfaceSubtle, color: theme.text }]}
              placeholder="Goal Name (e.g., Summer Trip)"
              placeholderTextColor={theme.textMuted}
              value={goalName}
              onChangeText={setGoalName}
            />
            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.surfaceSubtle, color: theme.text }]}
              keyboardType="decimal-pad"
              placeholder="Target Amount (e.g., 2500)"
              placeholderTextColor={theme.textMuted}
              value={goalTargetStr}
              onChangeText={setGoalTargetStr}
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { backgroundColor: theme.surfaceSubtle }]}
                onPress={() => setShowAddGoalModal(false)}
              >
                <Text style={{ color: theme.textSecondary, fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmBtn, { backgroundColor: theme.primary }]}
                onPress={handleSaveGoal}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Create Goal</Text>
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
    gap: 20,
  },
  subscriptionCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  subCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  subIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subCardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  subCardSub: {
    fontSize: 12,
    marginTop: 1,
  },
  subCardTotal: {
    fontSize: 16,
    fontWeight: '800',
  },
  subItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  subItemName: {
    fontSize: 13,
    fontWeight: '600',
  },
  subItemAmount: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyHintText: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  section: {
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  budgetCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    gap: 10,
  },
  budgetTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetCatInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  catIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetName: {
    fontSize: 15,
    fontWeight: '700',
  },
  budgetActions: {
    flexDirection: 'row',
  },
  editBtn: {
    padding: 6,
  },
  budgetNumbersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  spentText: {
    fontSize: 16,
    fontWeight: '800',
  },
  pctText: {
    fontSize: 14,
    fontWeight: '800',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  alertText: {
    fontSize: 11,
    color: '#F43F5E',
    fontWeight: '700',
  },
  setupBudgetBox: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    gap: 8,
  },
  setupBudgetTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  setupBudgetSub: {
    fontSize: 12,
    marginBottom: 4,
  },
  catChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  addGoalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  addGoalBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  goalCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  goalTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  goalIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalName: {
    fontSize: 15,
    fontWeight: '700',
  },
  goalTarget: {
    fontSize: 12,
    marginTop: 1,
  },
  goalBoostBtns: {
    flexDirection: 'row',
    gap: 6,
  },
  boostBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  boostBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  goalProgressWrap: {
    gap: 6,
  },
  goalProgressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalSavedLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  goalPctLabel: {
    fontSize: 12,
    fontWeight: '800',
  },
  emptyGoalCard: {
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  emptyGoalTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  emptyGoalSub: {
    fontSize: 12,
    textAlign: 'center',
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
  modalBoxTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  modalInput: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 14,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
});
