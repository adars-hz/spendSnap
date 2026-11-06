import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export const triggerLightHaptic = () => {
  if (Platform.OS !== 'web') {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      // Haptics unavailable
    }
  }
};

export const triggerMediumHaptic = () => {
  if (Platform.OS !== 'web') {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {
      // Haptics unavailable
    }
  }
};

export const triggerSuccessHaptic = () => {
  if (Platform.OS !== 'web') {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      // Haptics unavailable
    }
  }
};

export const triggerErrorHaptic = () => {
  if (Platform.OS !== 'web') {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (e) {
      // Haptics unavailable
    }
  }
};

