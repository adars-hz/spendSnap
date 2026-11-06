import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { Lock, Fingerprint, Delete } from 'lucide-react-native';
import { useExpenseStore } from '../store/useExpenseStore';
import { darkTheme, lightTheme } from '../constants/theme';
import {
  triggerLightHaptic,
  triggerSuccessHaptic,
  triggerErrorHaptic,
} from '../services/hapticsService';

interface SecurityLockModalProps {
  visible: boolean;
  onUnlocked: () => void;
}

export const SecurityLockModal: React.FC<SecurityLockModalProps> = ({
  visible,
  onUnlocked,
}) => {
  const { isDarkMode, pinCode } = useExpenseStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const [enteredPin, setEnteredPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Attempt biometric authentication when lock modal opens
  useEffect(() => {
    if (visible) {
      setEnteredPin('');
      setErrorMessage('');
      promptBiometrics();
    }
  }, [visible]);

  const promptBiometrics = async () => {
    if (Platform.OS === 'web') return;

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (hasHardware && isEnrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Unlock SpendSnap with Biometrics',
          fallbackLabel: 'Enter PIN Code',
          cancelLabel: 'Use PIN',
        });

        if (result.success) {
          triggerSuccessHaptic();
          onUnlocked();
        }
      }
    } catch (e) {
      console.log('Biometric error:', e);
    }
  };

  const handleKeyPress = (num: string) => {
    triggerLightHaptic();
    setErrorMessage('');

    if (enteredPin.length < 4) {
      const newPin = enteredPin + num;
      setEnteredPin(newPin);

      if (newPin.length === 4) {
        verifyPin(newPin);
      }
    }
  };

  const handleDelete = () => {
    triggerLightHaptic();
    setEnteredPin((prev) => prev.slice(0, -1));
    setErrorMessage('');
  };

  const verifyPin = (candidate: string) => {
    if (candidate === (pinCode || '1234')) {
      triggerSuccessHaptic();
      setEnteredPin('');
      onUnlocked();
    } else {
      triggerErrorHaptic();
      setErrorMessage('Incorrect PIN code. Try again.');
      setTimeout(() => setEnteredPin(''), 300);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={false}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Lock Header */}
        <View style={styles.header}>
          <View style={[styles.shieldBadge, { backgroundColor: theme.surfaceSubtle }]}>
            <Lock size={32} color={theme.primary} />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>SpendSnap Locked</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>
            Enter 4-digit PIN or use Biometrics to access
          </Text>
        </View>

        {/* PIN Indicators (4 Dots) */}
        <View style={styles.dotsRow}>
          {[0, 1, 2, 3].map((index) => {
            const isFilled = enteredPin.length > index;
            return (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor: isFilled ? theme.primary : 'transparent',
                    borderColor: isFilled ? theme.primary : theme.borderSubtle,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Error message */}
        <View style={styles.errorBox}>
          {errorMessage !== '' && (
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}
        </View>

        {/* Keypad */}
        <View style={styles.keypad}>
          {[
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
          ].map((row, rIndex) => (
            <View key={rIndex} style={styles.keyRow}>
              {row.map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[styles.keyBtn, { backgroundColor: theme.surface }]}
                  onPress={() => handleKeyPress(num)}
                  activeOpacity={0.65}
                >
                  <Text style={[styles.keyText, { color: theme.text }]}>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}

          {/* Bottom row: Biometrics, 0, Delete */}
          <View style={styles.keyRow}>
            <TouchableOpacity
              style={[styles.keyBtn, { backgroundColor: theme.surfaceSubtle }]}
              onPress={promptBiometrics}
              activeOpacity={0.65}
            >
              <Fingerprint size={24} color={theme.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.keyBtn, { backgroundColor: theme.surface }]}
              onPress={() => handleKeyPress('0')}
              activeOpacity={0.65}
            >
              <Text style={[styles.keyText, { color: theme.text }]}>0</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.keyBtn, { backgroundColor: theme.surfaceSubtle }]}
              onPress={handleDelete}
              activeOpacity={0.65}
            >
              <Delete size={22} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
  },
  shieldBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 18,
    marginBottom: 16,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  errorBox: {
    height: 24,
    marginBottom: 12,
  },
  errorText: {
    color: '#F43F5E',
    fontSize: 13,
    fontWeight: '600',
  },
  keypad: {
    width: '100%',
    maxWidth: 290,
    gap: 14,
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  keyBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontSize: 26,
    fontWeight: '700',
  },
});

