/**
 * Rule-based list name suggestion based on restaurant attributes.
 * No API call — pure logic using cuisine_type and district.
 */

interface RestaurantForSuggestion {
  cuisine_type: string;
  district?: string;
  name?: string;
}

interface ListSuggestion {
  title: string;
  emoji: string;
}

const CUISINE_SUGGESTIONS: Record<string, ListSuggestion> = {
  drinks:            { title: 'Café Spots', emoji: '☕' },
  dessert:           { title: 'Sweet Spots', emoji: '🍨' },
  bread:             { title: 'Bánh Mì Spots', emoji: '🥖' },
  seafood:           { title: 'Seafood Spots', emoji: '🦐' },
  hotpot_grill:      { title: 'Hotpot & Grill', emoji: '🍲' },
  fast_food:         { title: 'Quick Bites', emoji: '🍔' },
  healthy:           { title: 'Healthy Eats', emoji: '🥗' },
  veggie:            { title: 'Veggie Spots', emoji: '🥦' },
  international:     { title: 'International Spots', emoji: '🌍' },
  snack:             { title: 'Snack Spots', emoji: '🍿' },
  vietnamese_cakes:  { title: 'Vietnamese Cakes', emoji: '🍰' },
};

export function suggestListName(restaurant: RestaurantForSuggestion): ListSuggestion {
  const { cuisine_type, name = '' } = restaurant;
  const nameLower = name.toLowerCase();

  // Noodle sub-type detection from name
  if (cuisine_type === 'noodles_congee') {
    if (nameLower.includes('phở') || nameLower.includes('pho')) {
      return { title: 'Phở Spots', emoji: '🍜' };
    }
    if (nameLower.includes('bún bò') || nameLower.includes('bun bo')) {
      return { title: 'Bún Bò Spots', emoji: '🌶️' };
    }
    if (nameLower.includes('bún') || nameLower.includes('bun')) {
      return { title: 'Bún Spots', emoji: '🍜' };
    }
    return { title: 'Noodle Spots', emoji: '🍜' };
  }

  if (cuisine_type === 'rice') {
    if (nameLower.includes('cơm tấm') || nameLower.includes('com tam')) {
      return { title: 'Cơm Tấm Spots', emoji: '🍚' };
    }
    return { title: 'Rice Spots', emoji: '🍚' };
  }

  return CUISINE_SUGGESTIONS[cuisine_type] ?? { title: 'Want to Go', emoji: '📌' };
}

/**
 * Default quick-start list templates shown in the Create List sheet.
 */
export const LIST_TEMPLATES: ListSuggestion[] = [
  { title: 'Want to Go',            emoji: '📌' },
  { title: 'From TikTok',           emoji: '🎬' },
  { title: 'Date Night',            emoji: '💑' },
  { title: 'Cheap Eats',            emoji: '💰' },
  { title: 'Café Spots',            emoji: '☕' },
  { title: 'Drinks & Cocktails',    emoji: '🍺' },
  { title: 'Late Night',            emoji: '🌙' },
  { title: 'Phở Spots',             emoji: '🍜' },
  { title: 'Bánh Mì Spots',         emoji: '🥖' },
  { title: 'Work Lunch',            emoji: '🏢' },
];
