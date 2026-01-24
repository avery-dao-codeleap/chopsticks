export * from './database';

// App-specific types
export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  name: string;
  age: number | null;
  bio: string | null;
  profileImageUrl: string | null;
  verificationStatus: 'unverified' | 'pending' | 'verified';
  mealCount: number;
}

export interface UserPreferences {
  cuisineTypes: string[];
  dietaryRestrictions: string[];
  allergies: string[];
  budgetMin: number;
  budgetMax: number;
  preferredRadiusKm: number;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  cuisineType: string;
  priceRange: 'cheap' | 'moderate' | 'expensive';
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  imageUrls: string[];
  visitCount: number;
  ratingAvg: number | null;
  isHiddenGem: boolean;
}

export interface Match {
  id: string;
  user1Id: string;
  user2Id: string;
  status: 'pending' | 'accepted' | 'expired' | 'completed';
  restaurantId: string | null;
  scheduledTime: string | null;
  expiresAt: string;
  otherUser?: User; // Populated when fetching matches
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  sentAt: string;
  readAt: string | null;
}

// Cuisine options for Vietnam
export const CUISINE_TYPES = [
  'Vietnamese',
  'Chinese',
  'Korean',
  'Japanese',
  'Thai',
  'Indian',
  'Western',
  'Fusion',
  'Street Food',
  'Seafood',
  'BBQ',
  'Vegetarian',
  'Desserts',
  'Coffee & Drinks',
] as const;

export const DIETARY_RESTRICTIONS = [
  'Vegetarian',
  'Vegan',
  'Halal',
  'Kosher',
  'Gluten-free',
  'Dairy-free',
] as const;

export const COMMON_ALLERGIES = [
  'Peanuts',
  'Shellfish',
  'Fish',
  'Eggs',
  'Soy',
  'Gluten',
  'Dairy',
] as const;

// Cities for launch
export const SUPPORTED_CITIES = [
  { id: 'hcmc', name: 'Ho Chi Minh City', lat: 10.8231, lng: 106.6297 },
  { id: 'hanoi', name: 'Hanoi', lat: 21.0285, lng: 105.8542 },
] as const;
