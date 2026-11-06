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
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { X, Camera, Image as ImageIcon, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react-native';
import { parseReceiptImage, ScannedReceiptResult } from '../services/ocrService';
import { useExpenseStore } from '../store/useExpenseStore';
import { darkTheme, lightTheme } from '../constants/theme';
import { formatCurrency } from '../constants/currencies';

interface ReceiptScanModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ReceiptScanModal: React.FC<ReceiptScanModalProps> = ({ visible, onClose }) => {
  const { isDarkMode, currency, accounts, categories, addTransaction } = useExpenseStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScannedReceiptResult | null>(null);

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
      });

      if (!result.canceled && result.assets.length > 0) {
        processReceipt(result.assets[0].uri);
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
      });

      if (!result.canceled && result.assets.length > 0) {
        processReceipt(result.assets[0].uri);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Unable to access camera.');
    }
  };

  // Demo presets for immediate test drive without real camera/photo
  const handleDemoReceipt = (hint: string) => {
    const mockUri = `https://images.unsplash.com/photo-1554415707-9e4466b88738?auto=format&fit=crop&w=400&q=80`;
    processReceipt(mockUri, hint);
  };

  const processReceipt = async (uri: string, hint?: string) => {
    setImageUri(uri);
    setIsScanning(true);
    setScanResult(null);

    try {
      const result = await parseReceiptImage(uri, hint);
      setScanResult(result);
    } catch (error) {
      Alert.alert('Scan Failed', 'Could not read receipt information.');
    } finally {
      setIsScanning(false);
    }
  };

  // Commit extracted receipt to transactions
  const handleConfirmExpense = () => {
    if (!scanResult || !defaultAccount) return;

    addTransaction({
      type: 'expense',
      amount: scanResult.totalAmount,
      categoryId: scanResult.suggestedCategoryId,
      accountId: defaultAccount.id,
      date: scanResult.date,
      note: scanResult.merchant,
      tags: scanResult.suggestedTags,
      receiptUri: imageUri || undefined,
    });

    Alert.alert('Success', `Logged ${formatCurrency(scanResult.totalAmount, currency)} for ${scanResult.merchant}!`);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setImageUri(null);
    setScanResult(null);
    setIsScanning(false);
  };

  const matchedCat = categories.find((c) => c.id === scanResult?.suggestedCategoryId);

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
                <Text style={styles.sparkleText}>Smart AI</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleReset} style={styles.closeBtn}>
              <RefreshCw size={18} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* If no image selected yet: choose photo */}
            {!imageUri && (
              <View style={styles.pickSection}>
                <View style={[styles.cameraPlaceholder, { backgroundColor: theme.surfaceSubtle }]}>
                  <Camera size={44} color={theme.primary} />
                  <Text style={[styles.pickTitle, { color: theme.text }]}>Snap or Upload Receipt</Text>
                  <Text style={[styles.pickSub, { color: theme.textSecondary }]}>
                    AI will instantly extract merchant, items, date, and calculate the total amount.
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

                {/* Instant Demo Presets */}
                <View style={styles.presetsSection}>
                  <Text style={[styles.presetTitle, { color: theme.textMuted }]}>
                    OR TEST WITH ONE-TAP RECEIPT PRESETS
                  </Text>
                  <View style={styles.presetButtons}>
                    <TouchableOpacity
                      style={[styles.presetBtn, { backgroundColor: theme.surfaceSubtle }]}
                      onPress={() => handleDemoReceipt('starbucks')}
                    >
                      <Text style={[styles.presetBtnText, { color: theme.text }]}>☕ Starbucks Cafe</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.presetBtn, { backgroundColor: theme.surfaceSubtle }]}
                      onPress={() => handleDemoReceipt('whole foods')}
                    >
                      <Text style={[styles.presetBtnText, { color: theme.text }]}>🛒 Whole Foods</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.presetBtn, { backgroundColor: theme.surfaceSubtle }]}
                      onPress={() => handleDemoReceipt('uber')}
                    >
                      <Text style={[styles.presetBtnText, { color: theme.text }]}>🚗 Uber Ride</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* Scanning State */}
            {isScanning && (
              <View style={styles.scanningBox}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.scanningTitle, { color: theme.text }]}>
                  Analyzing Receipt Image...
                </Text>
                <Text style={[styles.scanningSub, { color: theme.textMuted }]}>
                  Extracting line items, merchant name, and total amount
                </Text>
              </View>
            )}

            {/* Scan Results View */}
            {scanResult && !isScanning && (
              <View style={styles.resultsContainer}>
                {/* Result Card */}
                <View style={[styles.resultCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <View style={styles.resultHeader}>
                    <View>
                      <Text style={[styles.resultMerchant, { color: theme.text }]}>
                        {scanResult.merchant}
                      </Text>
                      <Text style={[styles.resultDate, { color: theme.textMuted }]}>
                        {scanResult.date} • {matchedCat?.name || 'Expense'}
                      </Text>
                    </View>
                    <View style={styles.confidenceBadge}>
                      <CheckCircle2 size={14} color="#10B981" />
                      <Text style={styles.confidenceText}>
                        {(scanResult.confidence * 100).toFixed(0)}% Match
                      </Text>
                    </View>
                  </View>

                  {/* Total Amount Display */}
                  <View style={styles.amountBanner}>
                    <Text style={[styles.amountBannerLabel, { color: theme.textMuted }]}>
                      EXTRACTED TOTAL
                    </Text>
                    <Text style={[styles.amountBannerVal, { color: '#F43F5E' }]}>
                      {formatCurrency(scanResult.totalAmount, currency)}
                    </Text>
                  </View>

                  {/* Line Items Breakdown */}
                  {scanResult.items && scanResult.items.length > 0 && (
                    <View style={styles.itemsList}>
                      <Text style={[styles.itemsHeader, { color: theme.textSecondary }]}>
                        DETECTED LINE ITEMS
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
                </View>

                {/* Confirm and Log Button */}
                <TouchableOpacity
                  style={[styles.confirmBtn, { backgroundColor: theme.primary }]}
                  onPress={handleConfirmExpense}
                >
                  <Text style={styles.confirmBtnText}>Confirm & Log Expense</Text>
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
    paddingBottom: 36,
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
    maxWidth: 280,
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
  presetsSection: {
    marginTop: 10,
    gap: 10,
  },
  presetTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  presetButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  presetBtnText: {
    fontSize: 12,
    fontWeight: '600',
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
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  resultMerchant: {
    fontSize: 18,
    fontWeight: '800',
  },
  resultDate: {
    fontSize: 12,
    marginTop: 2,
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
  amountBanner: {
    padding: 12,
    backgroundColor: 'rgba(244, 63, 94, 0.08)',
    borderRadius: 12,
    alignItems: 'center',
  },
  amountBannerLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  amountBannerVal: {
    fontSize: 28,
    fontWeight: '900',
    marginTop: 2,
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

