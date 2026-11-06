import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  X,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { parseReceiptImage, ScannedReceiptResult } from '../services/ocrService';
import { useExpenseStore } from '../store/useExpenseStore';
import { darkTheme, lightTheme } from '../constants/theme';
import { CURRENCIES, formatCurrency } from '../constants/currencies';
import { CategoryIcon } from './CategoryIcon';
import { triggerSuccessHaptic, triggerLightHaptic } from '../services/hapticsService';

interface ReceiptScanModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ReceiptScanModal: React.FC<ReceiptScanModalProps> = ({ visible, onClose }) => {
  const { isDarkMode, currency, accounts, categories, addTransaction } = useExpenseStore();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const currentCurrency = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScannedReceiptResult | null>(null);

  // Editable fields for reviewed extracted data
  const [merchant, setMerchant] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [date, setDate] = useState('');
  const [selectedCatId, setSelectedCatId] = useState('');
  const [showRawText, setShowRawText] = useState(false);

  const defaultAccount = accounts.find((a) => a.isDefault) || accounts[0];

  // Pick from device photo gallery
  const handlePickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Please allow photo gallery access to scan receipts.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        processReceipt(result.assets[0].uri, result.assets[0].base64);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Unable to pick image.');
    }
  };

  // Capture with device camera
  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Camera access is required to take receipt photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        processReceipt(result.assets[0].uri, result.assets[0].base64);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Unable to access camera.');
    }
  };

  const processReceipt = async (uri: string, base64?: string | null) => {
    setImageUri(uri);
    setIsScanning(true);
    setScanResult(null);

    try {
      const result = await parseReceiptImage(uri, base64 || undefined);
      setScanResult(result);
      setMerchant(result.merchant);
      setAmountStr(result.totalAmount > 0 ? result.totalAmount.toFixed(2) : '');
      setDate(result.date);
      setSelectedCatId(result.suggestedCategoryId);
      triggerSuccessHaptic();
    } catch (error) {
      Alert.alert('Scan Failed', 'Could not read receipt image. You can enter details manually.');
      const today = new Date().toISOString().split('T')[0];
      setMerchant('Receipt Expense');
      setAmountStr('');
      setDate(today);
      setSelectedCatId('cat-groceries');
    } finally {
      setIsScanning(false);
    }
  };

  // Commit extracted & verified receipt to transactions
  const handleConfirmExpense = () => {
    const parsedAmount = parseFloat(amountStr);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please verify the numeric amount.');
      return;
    }

    if (!defaultAccount) return;

    addTransaction({
      type: 'expense',
      amount: parsedAmount,
      categoryId: selectedCatId || 'cat-groceries',
      accountId: defaultAccount.id,
      date: date || new Date().toISOString().split('T')[0],
      note: merchant.trim() || 'Receipt Expense',
      tags: scanResult?.suggestedTags || ['receipt'],
      receiptUri: imageUri || undefined,
    });

    triggerSuccessHaptic();
    Alert.alert('Logged Successfully', `${merchant || 'Expense'} of ${formatCurrency(parsedAmount, currency)} saved.`);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setImageUri(null);
    setScanResult(null);
    setIsScanning(false);
    setMerchant('');
    setAmountStr('');
    setDate('');
    setShowRawText(false);
  };

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalSheet, { backgroundColor: theme.surface }]}>
          {/* Header */}
          <View style={[styles.headerRow, { borderBottomColor: theme.border }]}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={theme.textMuted} />
            </TouchableOpacity>
            <View style={styles.titleWithBadge}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>SpendSnap OCR</Text>
              <View style={[styles.sparkleBadge, { backgroundColor: '#EEF2FF' }]}>
                <Sparkles size={12} color="#6366F1" />
                <Text style={styles.sparkleText}>Vision Scanner</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleReset} style={styles.closeBtn}>
              <RefreshCw size={18} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* If no image selected yet */}
            {!imageUri && (
              <View style={styles.pickSection}>
                <View style={[styles.cameraPlaceholder, { backgroundColor: theme.surfaceSubtle }]}>
                  <Camera size={44} color={theme.primary} />
                  <Text style={[styles.pickTitle, { color: theme.text }]}>Capture or Pick Receipt</Text>
                  <Text style={[styles.pickSub, { color: theme.textSecondary }]}>
                    Take a clear photo of your bill, receipt, or invoice. Real OCR reads merchant, total, date, and items.
                  </Text>
                </View>

                {/* Primary Action Buttons */}
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.primaryActionBtn, { backgroundColor: theme.primary }]}
                    onPress={handleTakePhoto}
                  >
                    <Camera size={18} color="#FFFFFF" />
                    <Text style={styles.primaryActionBtnText}>Take Photo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.primaryActionBtn, { backgroundColor: '#6366F1' }]}
                    onPress={handlePickImage}
                  >
                    <ImageIcon size={18} color="#FFFFFF" />
                    <Text style={styles.primaryActionBtnText}>Photo Library</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Scanning State */}
            {isScanning && (
              <View style={styles.scanningBox}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.scanningTitle, { color: theme.text }]}>
                  Reading Receipt Text via OCR...
                </Text>
                <Text style={[styles.scanningSub, { color: theme.textMuted }]}>
                  Scanning line items, store name, date, and calculating total
                </Text>
              </View>
            )}

            {/* Scan Results & Editable Review View */}
            {scanResult && !isScanning && (
              <View style={styles.resultsContainer}>
                {/* Result Card */}
                <View style={[styles.resultCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <View style={styles.reviewHeader}>
                    <Text style={[styles.reviewHeaderTitle, { color: theme.textSecondary }]}>
                      REVIEW & CONFIRM DETAILS
                    </Text>
                    <View style={styles.confidenceBadge}>
                      <CheckCircle2 size={13} color="#16A34A" />
                      <Text style={styles.confidenceText}>OCR Scanned</Text>
                    </View>
                  </View>

                  {/* Editable Total Amount */}
                  <View style={styles.fieldSection}>
                    <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
                      TOTAL AMOUNT ({currentCurrency.symbol})
                    </Text>
                    <View style={[styles.amountInputRow, { backgroundColor: theme.surfaceSubtle }]}>
                      <Text style={[styles.currencyPrefix, { color: '#F43F5E' }]}>
                        {currentCurrency.symbol}
                      </Text>
                      <TextInput
                        style={[styles.amountInput, { color: theme.text }]}
                        keyboardType="decimal-pad"
                        placeholder="0.00"
                        placeholderTextColor={theme.textMuted}
                        value={amountStr}
                        onChangeText={setAmountStr}
                      />
                    </View>
                  </View>

                  {/* Editable Merchant Name */}
                  <View style={styles.fieldSection}>
                    <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>MERCHANT / STORE</Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        { backgroundColor: theme.surfaceSubtle, color: theme.text, borderColor: theme.border },
                      ]}
                      placeholder="Store Name"
                      placeholderTextColor={theme.textMuted}
                      value={merchant}
                      onChangeText={setMerchant}
                    />
                  </View>

                  {/* Editable Date */}
                  <View style={styles.fieldSection}>
                    <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>DATE (YYYY-MM-DD)</Text>
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

                  {/* Category Selector */}
                  <View style={styles.fieldSection}>
                    <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>CATEGORY</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catChipsRow}>
                      {expenseCategories.map((cat) => {
                        const isSelected = selectedCatId === cat.id;
                        return (
                          <TouchableOpacity
                            key={cat.id}
                            style={[
                              styles.catChip,
                              {
                                backgroundColor: isSelected ? cat.color : theme.surfaceSubtle,
                                borderColor: isSelected ? cat.color : theme.border,
                              },
                            ]}
                            onPress={() => {
                              triggerLightHaptic();
                              setSelectedCatId(cat.id);
                            }}
                          >
                            <CategoryIcon
                              name={cat.icon}
                              size={14}
                              color={isSelected ? '#FFFFFF' : cat.color}
                            />
                            <Text
                              style={[
                                styles.catChipText,
                                { color: isSelected ? '#FFFFFF' : theme.text },
                              ]}
                            >
                              {cat.name}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>

                  {/* Itemized Lines (if detected) */}
                  {scanResult.items && scanResult.items.length > 0 && (
                    <View style={styles.itemsList}>
                      <Text style={[styles.itemsHeader, { color: theme.textSecondary }]}>
                        DETECTED ITEMS ({scanResult.items.length})
                      </Text>
                      {scanResult.items.map((item, index) => (
                        <View key={index} style={styles.itemRow}>
                          <Text style={[styles.itemName, { color: theme.text }]} numberOfLines={1}>
                            {item.name}
                          </Text>
                          <Text style={[styles.itemPrice, { color: theme.textSecondary }]}>
                            {formatCurrency(item.price, currency)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Collapsible Raw Text Inspector */}
                  {scanResult.rawText ? (
                    <View style={styles.rawTextContainer}>
                      <TouchableOpacity
                        style={styles.rawToggleBtn}
                        onPress={() => setShowRawText(!showRawText)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.rawToggleLeft}>
                          <FileText size={14} color={theme.textMuted} />
                          <Text style={[styles.rawToggleText, { color: theme.textMuted }]}>
                            {showRawText ? 'Hide Scanned Text' : 'View Raw Extracted Text'}
                          </Text>
                        </View>
                        {showRawText ? (
                          <ChevronUp size={16} color={theme.textMuted} />
                        ) : (
                          <ChevronDown size={16} color={theme.textMuted} />
                        )}
                      </TouchableOpacity>

                      {showRawText && (
                        <View style={[styles.rawTextBox, { backgroundColor: theme.surfaceSubtle }]}>
                          <Text style={[styles.rawTextContent, { color: theme.textSecondary }]}>
                            {scanResult.rawText}
                          </Text>
                        </View>
                      )}
                    </View>
                  ) : null}
                </View>

                {/* Confirm and Log Button */}
                <TouchableOpacity
                  style={[styles.confirmBtn, { backgroundColor: theme.primary }]}
                  onPress={handleConfirmExpense}
                >
                  <Text style={styles.confirmBtnText}>Confirm & Save Expense</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.retryBtn} onPress={handleReset}>
                  <Text style={[styles.retryBtnText, { color: theme.textSecondary }]}>
                    Scan Another Receipt
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 16,
    maxHeight: '92%',
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
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  sparkleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  sparkleText: {
    color: '#6366F1',
    fontSize: 10,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  pickSection: {
    gap: 20,
  },
  cameraPlaceholder: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#374151',
    borderStyle: 'dashed',
    gap: 10,
  },
  pickTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 6,
  },
  pickSub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 290,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  scanningBox: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  scanningTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  scanningSub: {
    fontSize: 13,
    textAlign: 'center',
  },
  resultsContainer: {
    gap: 16,
  },
  resultCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    gap: 14,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewHeaderTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  confidenceText: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '700',
  },
  fieldSection: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  currencyPrefix: {
    fontSize: 26,
    fontWeight: '900',
    marginRight: 6,
  },
  amountInput: {
    fontSize: 28,
    fontWeight: '900',
    flex: 1,
  },
  textInput: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    fontSize: 14,
    borderWidth: 1,
  },
  catChipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemsList: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingTop: 12,
  },
  itemsHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 13,
    flex: 1,
    marginRight: 8,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '600',
  },
  rawTextContainer: {
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingTop: 10,
    gap: 8,
  },
  rawToggleBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  rawToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rawToggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rawTextBox: {
    borderRadius: 10,
    padding: 10,
    maxHeight: 140,
  },
  rawTextContent: {
    fontSize: 11,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  confirmBtn: {
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  retryBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  retryBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
