// Cuisine types available in the app
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

export type CuisineType = (typeof CUISINE_TYPES)[number];

// Dietary restrictions
export const DIETARY_RESTRICTIONS = [
  'Vegetarian',
  'Vegan',
  'Halal',
  'Kosher',
  'Gluten-free',
  'Dairy-free',
] as const;

export type DietaryRestriction = (typeof DIETARY_RESTRICTIONS)[number];

// Common allergies
export const COMMON_ALLERGIES = [
  'Peanuts',
  'Shellfish',
  'Fish',
  'Eggs',
  'Soy',
  'Gluten',
  'Dairy',
] as const;

export type Allergy = (typeof COMMON_ALLERGIES)[number];

// Supported cities for launch
export const SUPPORTED_CITIES = [
  { id: 'hcmc', name: 'Ho Chi Minh City', lat: 10.8231, lng: 106.6297, country: 'Vietnam' },
  { id: 'hanoi', name: 'Hanoi', lat: 21.0285, lng: 105.8542, country: 'Vietnam' },
] as const;

export type SupportedCity = (typeof SUPPORTED_CITIES)[number];

// Price ranges
export const PRICE_RANGES = {
  cheap: { min: 0, max: 100000, label: 'Budget-friendly', emoji: '💵' },
  moderate: { min: 100000, max: 300000, label: 'Mid-range', emoji: '💰' },
  expensive: { min: 300000, max: 1000000, label: 'Premium', emoji: '💎' },
} as const;

export type PriceRange = keyof typeof PRICE_RANGES;

// Match status
export const MATCH_STATUS = {
  pending: 'pending',
  accepted: 'accepted',
  expired: 'expired',
  completed: 'completed',
} as const;

export type MatchStatus = keyof typeof MATCH_STATUS;

// Match expiration time (in hours)
export const MATCH_EXPIRATION_HOURS = 24;

// Meal time buffer (in hours) - match expires if past this time
export const MEAL_TIME_BUFFER_HOURS = 1;

// Default search radius (in km)
export const DEFAULT_SEARCH_RADIUS_KM = 5;

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20;

// Profile image constraints
export const PROFILE_IMAGE = {
  maxSizeBytes: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  aspectRatio: 1, // Square
};

// Bio constraints
export const BIO_MAX_LENGTH = 200;

// Rating scale
export const RATING_SCALE = {
  min: 1,
  max: 5,
};
