import { z } from 'zod';

// User schemas
export const userProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  age: z.number().int().min(18, 'Must be at least 18').max(100),
  bio: z.string().max(200).optional().nullable(),
  profileImageUrl: z.string().url().optional().nullable(),
});

export const userPreferencesSchema = z.object({
  cuisineTypes: z.array(z.string()).min(1, 'Select at least one cuisine'),
  dietaryRestrictions: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
  budgetMin: z.number().min(0).default(0),
  budgetMax: z.number().min(0).default(500000),
  preferredRadiusKm: z.number().min(1).max(50).default(10),
});

// Restaurant schemas
export const restaurantSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  cuisineType: z.string().min(2),
  priceRange: z.enum(['cheap', 'moderate', 'expensive']),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().min(5),
  city: z.string().min(2),
  imageUrls: z.array(z.string().url()).default([]),
});

// Match schemas
export const matchRequestSchema = z.object({
  userId: z.string().uuid(),
  message: z.string().max(200).optional(),
});

export const matchUpdateSchema = z.object({
  status: z.enum(['accepted', 'expired', 'completed']),
  restaurantId: z.string().uuid().optional(),
  scheduledTime: z.string().datetime().optional(),
});

// Message schemas
export const messageSchema = z.object({
  content: z.string().min(1).max(1000),
});

// Type exports
export type UserProfile = z.infer<typeof userProfileSchema>;
export type UserPreferences = z.infer<typeof userPreferencesSchema>;
export type Restaurant = z.infer<typeof restaurantSchema>;
export type MatchRequest = z.infer<typeof matchRequestSchema>;
export type MatchUpdate = z.infer<typeof matchUpdateSchema>;
export type Message = z.infer<typeof messageSchema>;
