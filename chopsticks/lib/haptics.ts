import * as Haptics from 'expo-haptics';

/**
 * Haptic feedback utilities for key interactions
 * Uses expo-haptics for consistent cross-platform feedback
 */

/**
 * Light haptic feedback for subtle interactions
 * Use for: button presses, toggles, selections
 */
export function lightHaptic() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

/**
 * Medium haptic feedback for standard interactions
 * Use for: confirmations, navigation, card taps
 */
export function mediumHaptic() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

/**
 * Heavy haptic feedback for important actions
 * Use for: deletions, cancellations, important confirmations
 */
export function heavyHaptic() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}

/**
 * Success haptic feedback
 * Use for: successful submissions, approvals, completions
 */
export function successHaptic() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

/**
 * Warning haptic feedback
 * Use for: warnings, cautions, reversible errors
 */
export function warningHaptic() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
}

/**
 * Error haptic feedback
 * Use for: errors, failures, irreversible actions
 */
export function errorHaptic() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}

/**
 * Selection haptic feedback
 * Use for: selecting items in a list, changing tabs
 */
export function selectionHaptic() {
  Haptics.selectionAsync();
}
