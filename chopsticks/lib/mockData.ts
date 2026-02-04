// ============================================================
// Mock Data for Chopsticks Lean MVP Prototype (HCMC only)
// ============================================================

export type Persona = 'local' | 'new_to_city' | 'expat' | 'traveler' | 'student';
export type JoinType = 'open' | 'approval';

export interface MockUser {
  id: string;
  name: string;
  age: number;
  gender: string;
  persona: Persona;
  mealCount: number;
  verified: boolean;
  bio?: string;
  cuisines?: string[];
}

export interface MockRestaurant {
  id: string;
  name: string;
  address: string;
  district: string;
  cuisine: string;
  budgetRange: 'under_50k' | '50k_150k' | '150k_500k' | '500k_plus';
  priceRange: 'under_50k' | '50k_150k' | '150k_500k' | '500k_plus'; // Alias for budgetRange
  latitude: number;
  longitude: number;
}

export interface MealRequest {
  id: string;
  restaurant: MockRestaurant;
  requester: MockUser;
  cuisine: string;
  cuisineId: string;
  cuisineEmoji: string;
  timeWindow: string;
  description?: string;
  spotsTotal: number; // 2-4 for MVP
  spotsTaken: number;
  joinType: JoinType;
}

export interface MockChat {
  id: string;
  type: 'group' | 'dm';
  title: string;
  participants: MockUser[];
  restaurantName?: string;
  requestId?: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
}

export interface MockMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  time: string;
  isMe: boolean;
}

export interface MockNotification {
  id: string;
  type: 'join_request' | 'join_approved' | 'new_message';
  title: string;
  body: string;
  time: string;
  read: boolean;
}

// ── Restaurants (HCMC Districts 1 & 3) ──────────────────────

export const MOCK_RESTAURANTS: MockRestaurant[] = [
  { id: 'r1', name: 'Phở Hòa Pasteur', address: '260C Pasteur', district: 'District 3', cuisine: 'Phở', budgetRange: 'under_50k', priceRange: 'under_50k', latitude: 10.7826, longitude: 106.6941 },
  { id: 'r2', name: 'Bún Bò Huế 3A3', address: '3A3 Hai Bà Trưng', district: 'District 1', cuisine: 'Bún', budgetRange: 'under_50k', priceRange: 'under_50k', latitude: 10.7724, longitude: 106.6989 },
  { id: 'r3', name: 'Bánh Mì Huynh Hoa', address: '26 Lê Thánh Tôn', district: 'District 1', cuisine: 'Bánh Mì', budgetRange: 'under_50k', priceRange: 'under_50k', latitude: 10.7752, longitude: 106.7034 },
  { id: 'r4', name: 'Quán Lẩu Dê Núi', address: '92 Điện Biên Phủ', district: 'District 1', cuisine: 'Hotpot', budgetRange: '50k_150k', priceRange: '50k_150k', latitude: 10.7780, longitude: 106.6924 },
  { id: 'r5', name: 'Sushi Hokkaido Sachi', address: '53 Cao Thắng', district: 'District 3', cuisine: 'Japanese', budgetRange: '150k_500k', priceRange: '150k_500k', latitude: 10.7780, longitude: 106.6880 },
  { id: 'r6', name: 'Quán Nướng BBQ Hàn Quốc', address: '45 Trần Hưng Đạo', district: 'District 1', cuisine: 'BBQ', budgetRange: '150k_500k', priceRange: '150k_500k', latitude: 10.7692, longitude: 106.6929 },
  { id: 'r7', name: 'Hải Sản Sơn', address: '12 Nguyễn Thị Minh Khai', district: 'District 3', cuisine: 'Seafood', budgetRange: '150k_500k', priceRange: '150k_500k', latitude: 10.7868, longitude: 106.6899 },
  { id: 'r8', name: 'The Workshop Coffee', address: '27 Ngô Đức Kế', district: 'District 1', cuisine: 'Cafe', budgetRange: '50k_150k', priceRange: '50k_150k', latitude: 10.7786, longitude: 106.7004 },
];

// ── Users ───────────────────────────────────────────────────

export const MOCK_USERS: MockUser[] = [
  { id: 'u1', name: 'Minh', age: 25, gender: 'Male', persona: 'local', mealCount: 42, verified: true, bio: 'Love a good bowl of phở in the morning', cuisines: ['noodles_congee', 'hotpot_grill'] },
  { id: 'u2', name: 'Sarah', age: 28, gender: 'Female', persona: 'traveler', mealCount: 8, verified: true, bio: 'Exploring HCMC one meal at a time!', cuisines: ['seafood', 'international'] },
  { id: 'u3', name: 'Duc', age: 27, gender: 'Male', persona: 'local', mealCount: 67, verified: true, bio: 'Street food is my religion', cuisines: ['snack', 'noodles_congee', 'bread'] },
  { id: 'u4', name: 'Hana', age: 24, gender: 'Female', persona: 'traveler', mealCount: 5, verified: true, bio: 'Foodie from Tokyo, here for the bún bò', cuisines: ['noodles_congee', 'international'] },
  { id: 'u5', name: 'Long', age: 30, gender: 'Male', persona: 'local', mealCount: 91, verified: true, bio: 'Hotpot enthusiast since forever', cuisines: ['hotpot_grill', 'seafood', 'rice'] },
  { id: 'u6', name: 'Emma', age: 26, gender: 'Female', persona: 'traveler', mealCount: 12, verified: false, bio: 'Trying to eat my way through every district', cuisines: ['bread', 'dessert', 'drinks'] },
];

// ── Meal Requests ───────────────────────────────────────────

export const MOCK_REQUESTS: MealRequest[] = [
  {
    id: 'req1',
    restaurant: MOCK_RESTAURANTS[0],
    requester: MOCK_USERS[0],
    cuisine: 'Phở',
    cuisineId: 'noodles_congee',
    cuisineEmoji: '🍜',
    timeWindow: 'Today, 12:30 PM',
    description: 'Looking for a phở buddy for lunch!',
    spotsTotal: 4,
    spotsTaken: 1,
    joinType: 'open',
  },
  {
    id: 'req2',
    restaurant: MOCK_RESTAURANTS[3],
    requester: MOCK_USERS[1],
    cuisine: 'Hotpot',
    cuisineId: 'hotpot_grill',
    cuisineEmoji: '🍲',
    timeWindow: 'Today, 7:00 PM',
    description: 'Hotpot night — the more the merrier!',
    spotsTotal: 4,
    spotsTaken: 2,
    joinType: 'open',
  },
  {
    id: 'req3',
    restaurant: MOCK_RESTAURANTS[5],
    requester: MOCK_USERS[2],
    cuisine: 'BBQ',
    cuisineId: 'hotpot_grill',
    cuisineEmoji: '🔥',
    timeWindow: 'Today, 8:30 PM',
    description: 'Korean BBQ — looking for meat lovers',
    spotsTotal: 4,
    spotsTaken: 3,
    joinType: 'approval',
  },
  {
    id: 'req4',
    restaurant: MOCK_RESTAURANTS[4],
    requester: MOCK_USERS[3],
    cuisine: 'Japanese',
    cuisineId: 'international',
    cuisineEmoji: '🍣',
    timeWindow: 'Today, 6:00 PM',
    description: 'Sushi night — let\'s try omakase together',
    spotsTotal: 2,
    spotsTaken: 1,
    joinType: 'open',
  },
  {
    id: 'req5',
    restaurant: MOCK_RESTAURANTS[6],
    requester: MOCK_USERS[4],
    cuisine: 'Seafood',
    cuisineId: 'seafood',
    cuisineEmoji: '🦐',
    timeWindow: 'Tomorrow, 11:30 AM',
    description: 'Fresh seafood lunch — who\'s in?',
    spotsTotal: 3,
    spotsTaken: 1,
    joinType: 'approval',
  },
  {
    id: 'req6',
    restaurant: MOCK_RESTAURANTS[2],
    requester: MOCK_USERS[5],
    cuisine: 'Bánh Mì',
    cuisineId: 'bread',
    cuisineEmoji: '🥖',
    timeWindow: 'Today, 1:00 PM',
    description: 'Best bánh mì in D1 — come try it!',
    spotsTotal: 2,
    spotsTaken: 0,
    joinType: 'open',
  },
];

// ── Chats ───────────────────────────────────────────────────

export const MOCK_CHATS: MockChat[] = [
  {
    id: 'c1',
    type: 'group',
    title: 'Phở Hòa Lunch',
    participants: [MOCK_USERS[0], MOCK_USERS[1]],
    restaurantName: 'Phở Hòa Pasteur',
    requestId: 'req1',
    lastMessage: 'See you at 12:30!',
    lastMessageTime: '5m',
    unread: 2,
  },
  {
    id: 'c2',
    type: 'group',
    title: 'Hotpot Night',
    participants: [MOCK_USERS[1], MOCK_USERS[2], MOCK_USERS[5]],
    restaurantName: 'Quán Lẩu Dê Núi',
    requestId: 'req2',
    lastMessage: 'Can we push to 7:30?',
    lastMessageTime: '1h',
    unread: 0,
  },
  {
    id: 'c3',
    type: 'dm',
    title: 'Duc',
    participants: [MOCK_USERS[2]],
    lastMessage: 'That bún bò was amazing!',
    lastMessageTime: '3h',
    unread: 1,
  },
];

export const MOCK_MESSAGES: MockMessage[] = [
  { id: 'm1', senderId: 'u1', senderName: 'Minh', text: 'Hey! Excited for phở today 🍜', time: '12:00 PM', isMe: false },
  { id: 'm2', senderId: 'me', senderName: 'You', text: 'Me too! Is the place easy to find?', time: '12:05 PM', isMe: true },
  { id: 'm3', senderId: 'u1', senderName: 'Minh', text: 'Yeah, it\'s right on Pasteur street. Look for the blue sign.', time: '12:08 PM', isMe: false },
  { id: 'm4', senderId: 'me', senderName: 'You', text: 'Perfect, see you at 12:30!', time: '12:10 PM', isMe: true },
  { id: 'm5', senderId: 'u1', senderName: 'Minh', text: 'See you there!', time: '12:12 PM', isMe: false },
];

// ── Notifications (MVP: 3 types only) ───────────────────────

export const MOCK_NOTIFICATIONS: MockNotification[] = [
  { id: 'n1', type: 'join_request', title: 'New join request', body: 'Sarah wants to join your BBQ meal', time: '2m ago', read: false },
  { id: 'n2', type: 'join_approved', title: 'Request approved!', body: 'Minh approved your request to join Phở Hòa Lunch', time: '15m ago', read: false },
  { id: 'n3', type: 'new_message', title: 'New message from Duc', body: 'That bún bò was amazing!', time: '1h ago', read: true },
  { id: 'n4', type: 'join_request', title: 'New join request', body: 'Emma wants to join your Hotpot Night', time: '2h ago', read: true },
  { id: 'n5', type: 'new_message', title: 'New message in Hotpot Night', body: 'Can we push to 7:30?', time: '3h ago', read: true },
];

// ── Filter Options (HCMC) ───────────────────────────────────

export const CUISINE_FILTERS = ['All', 'Phở', 'Bún', 'Bánh Mì', 'Hotpot', 'BBQ', 'Seafood', 'Japanese', 'Cafe'];
export const TIME_FILTERS = ['Any Time', 'ASAP', 'Morning', 'Midday', 'Afternoon', 'Evening', 'Late Night'];
export const BUDGET_FILTERS = ['Any', 'Under 50k', '50k-150k', '150k-500k', '500k+'];
export const DISTRICT_FILTERS = [
  'All Areas',
  'District 1',
  'District 2',
  'District 3',
  'District 4',
  'District 5',
  'District 7',
  'Bình Thạnh',
  'Phú Nhuận',
  'Thủ Đức',
];
export const TIME_PRESETS = [
  'Today, 12:00 PM',
  'Today, 12:30 PM',
  'Today, 1:00 PM',
  'Today, 6:00 PM',
  'Today, 6:30 PM',
  'Today, 7:00 PM',
  'Today, 7:30 PM',
  'Today, 8:00 PM',
  'Today, 8:30 PM',
  'Today, 9:00 PM',
  'Tomorrow, 11:30 AM',
  'Tomorrow, 12:00 PM',
  'Tomorrow, 7:00 PM',
];

// ── Current User (for prototype) ────────────────────────────

export const CURRENT_USER: MockUser = {
  id: 'me',
  name: 'Alex',
  age: 26,
  gender: 'Non-binary',
  persona: 'traveler',
  mealCount: 12,
  verified: true,
  bio: 'Food lover exploring HCMC one dish at a time',
  cuisines: ['noodles_congee', 'seafood', 'international'],
};
