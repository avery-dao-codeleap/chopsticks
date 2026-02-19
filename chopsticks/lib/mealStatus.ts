/**
 * Meal status utilities
 * Determines if a meal is active, completed, or archived
 */

export type MealStatus = 'active' | 'completed' | 'archived';

export interface MealStatusInfo {
  status: MealStatus;
  label: string;
  color: string;
  canSendMessages: boolean;
  canMarkComplete: boolean; // Creator can mark complete at any time
}

/**
 * Calculate meal status based on time_window and meal_completed_at
 */
export function getMealStatus(
  timeWindow: string,
  mealCompletedAt: string | null,
  isCreator: boolean = false
): MealStatusInfo {
  const now = new Date();
  const mealTime = new Date(timeWindow);
  const archiveTime = new Date(mealTime.getTime() + 24 * 60 * 60 * 1000); // 24h after meal time

  // Archived: 24 hours after time_window (regardless of completed status)
  if (now >= archiveTime) {
    return {
      status: 'archived',
      label: 'Archived',
      color: '#6b7280', // Grey
      canSendMessages: false,
      canMarkComplete: false,
    };
  }

  // Completed: meal_completed_at is set
  if (mealCompletedAt) {
    return {
      status: 'completed',
      label: 'Completed',
      color: '#10b981', // Green
      canSendMessages: true,
      canMarkComplete: false,
    };
  }

  // Active: before time_window
  if (now < mealTime) {
    return {
      status: 'active',
      label: 'Active',
      color: '#f97316', // Orange
      canSendMessages: true,
      canMarkComplete: isCreator, // Creator can mark complete at any time
    };
  }

  // Ended but not completed: after time_window, before archive, not marked complete
  return {
    status: 'active', // Still active for messaging
    label: 'Ended',
    color: '#eab308', // Yellow
    canSendMessages: true,
    canMarkComplete: isCreator, // Creator can mark complete
  };
}
