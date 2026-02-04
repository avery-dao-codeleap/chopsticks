// Lean MVP Constants for Chopsticks
// Based on product marketing context interview

// ============================================================================
// CUISINES (14 categories)
// ============================================================================

export const CUISINE_CATEGORIES = [
  { id: 'noodles_congee', label: 'Noodles & Congee', labelVi: 'Bún/Phở/Cháo' },
  { id: 'rice', label: 'Rice', labelVi: 'Cơm' },
  { id: 'hotpot_grill', label: 'Hotpot & Grill', labelVi: 'Lẩu & Nướng' },
  { id: 'seafood', label: 'Seafood', labelVi: 'Hải sản' },
  { id: 'bread', label: 'Bread', labelVi: 'Bánh mì' },
  { id: 'vietnamese_cakes', label: 'Vietnamese Cakes', labelVi: 'Bánh Việt' },
  { id: 'snack', label: 'Snack', labelVi: 'Ăn vặt' },
  { id: 'dessert', label: 'Dessert', labelVi: 'Tráng miệng' },
  { id: 'drinks', label: 'Drinks', labelVi: 'Đồ uống' },
  { id: 'fast_food', label: 'Fast Food', labelVi: 'Đồ ăn nhanh' },
  { id: 'international', label: 'International Food', labelVi: 'Món quốc tế' },
  { id: 'healthy', label: 'Healthy Food', labelVi: 'Đồ ăn healthy' },
  { id: 'veggie', label: 'Veggie', labelVi: 'Chay' },
  { id: 'others', label: 'Others', labelVi: 'Khác' },
] as const;

export type CuisineId = (typeof CUISINE_CATEGORIES)[number]['id'];

// ============================================================================
// BUDGET RANGES (4 tiers)
// ============================================================================

export const BUDGET_RANGES = [
  { id: 'under_50k', label: 'Under 50k', labelVi: 'Dưới 50k', min: 0, max: 50000 },
  { id: '50k_150k', label: '50k – 150k', labelVi: '50k – 150k', min: 50000, max: 150000 },
  { id: '150k_500k', label: '150k – 500k', labelVi: '150k – 500k', min: 150000, max: 500000 },
  { id: '500k_plus', label: '500k+', labelVi: 'Trên 500k', min: 500000, max: Infinity },
] as const;

export type BudgetRangeId = (typeof BUDGET_RANGES)[number]['id'];

// ============================================================================
// HO CHI MINH CITY DISTRICTS (22 total)
// ============================================================================

export const HCMC_DISTRICTS = [
  { id: 'district_1', name: 'District 1', nameVi: 'Quận 1' },
  { id: 'district_2', name: 'District 2', nameVi: 'Quận 2' },
  { id: 'district_3', name: 'District 3', nameVi: 'Quận 3' },
  { id: 'district_4', name: 'District 4', nameVi: 'Quận 4' },
  { id: 'district_5', name: 'District 5', nameVi: 'Quận 5' },
  { id: 'district_6', name: 'District 6', nameVi: 'Quận 6' },
  { id: 'district_7', name: 'District 7', nameVi: 'Quận 7' },
  { id: 'district_8', name: 'District 8', nameVi: 'Quận 8' },
  { id: 'district_9', name: 'District 9', nameVi: 'Quận 9' },
  { id: 'district_10', name: 'District 10', nameVi: 'Quận 10' },
  { id: 'district_11', name: 'District 11', nameVi: 'Quận 11' },
  { id: 'district_12', name: 'District 12', nameVi: 'Quận 12' },
  { id: 'thu_duc', name: 'Thủ Đức', nameVi: 'Thủ Đức' },
  { id: 'go_vap', name: 'Gò Vấp', nameVi: 'Gò Vấp' },
  { id: 'binh_thanh', name: 'Bình Thạnh', nameVi: 'Bình Thạnh' },
  { id: 'tan_binh', name: 'Tân Bình', nameVi: 'Tân Bình' },
  { id: 'tan_phu', name: 'Tân Phú', nameVi: 'Tân Phú' },
  { id: 'phu_nhuan', name: 'Phú Nhuận', nameVi: 'Phú Nhuận' },
  { id: 'binh_tan', name: 'Bình Tân', nameVi: 'Bình Tân' },
  { id: 'cu_chi', name: 'Củ Chi', nameVi: 'Củ Chi' },
  { id: 'hoc_mon', name: 'Hóc Môn', nameVi: 'Hóc Môn' },
  { id: 'nha_be', name: 'Nhà Bè', nameVi: 'Nhà Bè' },
] as const;

export type DistrictId = (typeof HCMC_DISTRICTS)[number]['id'];

// ============================================================================
// CITIES (HCMC only for MVP)
// ============================================================================

export const CITIES = [
  { id: 'hcmc', name: 'Ho Chi Minh City', nameVi: 'Thành phố Hồ Chí Minh', lat: 10.8231, lng: 106.6297 },
] as const;

export type CityId = (typeof CITIES)[number]['id'];

// ============================================================================
// PERSONA TYPES
// ============================================================================

export const PERSONA_TYPES = [
  { id: 'local', label: 'Local', labelVi: 'Người địa phương', description: 'I live here and know the food scene' },
  { id: 'new_to_city', label: 'New to the city', labelVi: 'Mới đến thành phố', description: 'I moved here recently' },
  { id: 'expat', label: 'Expat', labelVi: 'Người nước ngoài', description: "I live here but I'm not from Vietnam" },
  { id: 'traveler', label: 'Traveler', labelVi: 'Du khách', description: "I'm visiting" },
  { id: 'student', label: 'Student', labelVi: 'Sinh viên', description: "I'm studying here" },
] as const;

export type PersonaId = (typeof PERSONA_TYPES)[number]['id'];

// ============================================================================
// GENDER OPTIONS
// ============================================================================

export const GENDER_OPTIONS = [
  { id: 'male', label: 'Male', labelVi: 'Nam' },
  { id: 'female', label: 'Female', labelVi: 'Nữ' },
  { id: 'non_binary', label: 'Non-binary', labelVi: 'Phi nhị phân' },
  { id: 'prefer_not_to_say', label: 'Prefer not to say', labelVi: 'Không muốn nói' },
] as const;

export type GenderId = (typeof GENDER_OPTIONS)[number]['id'];

// ============================================================================
// REQUEST SETTINGS
// ============================================================================

export const REQUEST_SETTINGS = {
  minGroupSize: 2,
  maxGroupSize: 4, // MVP: Max 4 people
  maxDurationHours: 24, // Requests visible for 24h max
} as const;

export const JOIN_TYPES = [
  { id: 'open', label: 'Open', labelVi: 'Mở', description: 'Anyone can join immediately' },
  { id: 'approval', label: 'Approval', labelVi: 'Phê duyệt', description: 'You approve who joins' },
] as const;

export type JoinTypeId = (typeof JOIN_TYPES)[number]['id'];

// ============================================================================
// NOTIFICATION TYPES (MVP: 3 only)
// ============================================================================

export const NOTIFICATION_TYPES = [
  'join_request', // Someone wants to join your request
  'join_approved', // You've been approved
  'new_message',   // New chat message
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

// ============================================================================
// PROFILE CONSTRAINTS
// ============================================================================

export const PROFILE_CONSTRAINTS = {
  photo: {
    maxSizeBytes: 1 * 1024 * 1024, // 1MB (per constitution)
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
    aspectRatio: 1, // Square
  },
  name: {
    minLength: 1,
    maxLength: 50,
  },
  bio: {
    maxLength: 200,
    prompt: 'Tell us something food-related about yourself',
    promptVi: 'Hãy nói điều gì đó liên quan đến ẩm thực về bạn',
  },
  age: {
    min: 18,
    max: 100,
  },
} as const;

// ============================================================================
// CHAT CONSTRAINTS
// ============================================================================

export const CHAT_CONSTRAINTS = {
  messageMaxLength: 2000,
  chatExpireAfterCancelHours: 24, // Chat readable for 24h after cancel
  imageMaxSizeBytes: 1 * 1024 * 1024, // 1MB
} as const;

// ============================================================================
// RATING
// ============================================================================

export const RATING_OPTIONS = [
  { value: true, label: 'Yes, they showed up', labelVi: 'Có, họ đã đến' },
  { value: false, label: 'No, they didn\'t show up', labelVi: 'Không, họ không đến' },
] as const;

// ============================================================================
// LANGUAGES
// ============================================================================

export const LANGUAGES = [
  { id: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { id: 'en', label: 'English', flag: '🇺🇸' },
] as const;

export type LanguageId = (typeof LANGUAGES)[number]['id'];

// ============================================================================
// PERFORMANCE TARGETS (from constitution)
// ============================================================================

export const PERFORMANCE_TARGETS = {
  coldStartMaxMs: 3000,
  targetFps: 60,
  apiTimeoutMs: 10000,
} as const;

// ============================================================================
// RESTAURANT SEED DATA CONFIG
// ============================================================================

export const RESTAURANT_SEED_CONFIG = {
  targetCount: 100, // Manually curated list of ~50-100 restaurants
  requireDistrict: true,
} as const;
