import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { usePendingRatings } from '@/lib/hooks/queries/useRatings';

/**
 * Component that checks for pending ratings on mount
 * and navigates to the rating modal if any exist
 */
export function RatingPrompt() {
  const router = useRouter();
  const { data: pendingRatings, isSuccess } = usePendingRatings();
  const hasShownPrompt = React.useRef(false);

  useEffect(() => {
    // Only show prompt once per app session
    if (hasShownPrompt.current) return;

    // Wait for data to load successfully
    if (!isSuccess) return;

    // If there are pending ratings, navigate to the modal
    if (pendingRatings && pendingRatings.length > 0) {
      hasShownPrompt.current = true;
      // Small delay to let the main screen render first
      setTimeout(() => {
        router.push('/(screens)/rating-modal');
      }, 1000);
    }
  }, [pendingRatings, isSuccess, router]);

  // This component doesn't render anything
  return null;
}
