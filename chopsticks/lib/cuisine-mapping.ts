/**
 * Cuisine Categories with Sub-categories
 *
 * This mapping enables nested dropdowns for cuisine personalization.
 * Main categories are used in MVP; sub-categories reserved for future phases.
 *
 * Usage:
 * - MVP: Use CUISINE_CATEGORIES from constants.ts (flat list)
 * - Future: Use this mapping for "More options" nested selection
 */

export interface CuisineSubcategory {
  id: string;
  label: string;
  labelVi: string;
}

export interface CuisineCategory {
  id: string;
  label: string;
  labelVi: string;
  subcategories: CuisineSubcategory[];
}

export const CUISINE_MAPPING: CuisineCategory[] = [
  {
    id: 'noodles_congee',
    label: 'Noodles & Congee',
    labelVi: 'Bún/Phở/Cháo',
    subcategories: [
      { id: 'pho', label: 'Phở', labelVi: 'Phở' },
      { id: 'bun_bo', label: 'Bún Bò Huế', labelVi: 'Bún Bò Huế' },
      { id: 'bun_cha', label: 'Bún Chả', labelVi: 'Bún Chả' },
      { id: 'bun_rieu', label: 'Bún Riêu', labelVi: 'Bún Riêu' },
      { id: 'bun_moc', label: 'Bún Mọc', labelVi: 'Bún Mọc' },
      { id: 'hu_tieu', label: 'Hủ Tiếu', labelVi: 'Hủ Tiếu' },
      { id: 'mi_quang', label: 'Mì Quảng', labelVi: 'Mì Quảng' },
      { id: 'cao_lau', label: 'Cao Lầu', labelVi: 'Cao Lầu' },
      { id: 'chao', label: 'Cháo', labelVi: 'Cháo' },
      { id: 'mien', label: 'Miến', labelVi: 'Miến' },
    ],
  },
  {
    id: 'rice',
    label: 'Rice',
    labelVi: 'Cơm',
    subcategories: [
      { id: 'com_tam', label: 'Cơm Tấm', labelVi: 'Cơm Tấm' },
      { id: 'com_binh_dan', label: 'Cơm Bình Dân', labelVi: 'Cơm Bình Dân' },
      { id: 'com_ga', label: 'Cơm Gà', labelVi: 'Cơm Gà' },
      { id: 'com_chien', label: 'Cơm Chiên', labelVi: 'Cơm Chiên' },
      { id: 'com_nieu', label: 'Cơm Niêu', labelVi: 'Cơm Niêu' },
      { id: 'xoi', label: 'Xôi', labelVi: 'Xôi' },
    ],
  },
  {
    id: 'hotpot_grill',
    label: 'Hotpot & Grill',
    labelVi: 'Lẩu & Nướng',
    subcategories: [
      { id: 'lau_thai', label: 'Lẩu Thái', labelVi: 'Lẩu Thái' },
      { id: 'lau_hai_san', label: 'Lẩu Hải Sản', labelVi: 'Lẩu Hải Sản' },
      { id: 'lau_bo', label: 'Lẩu Bò', labelVi: 'Lẩu Bò' },
      { id: 'lau_ga', label: 'Lẩu Gà', labelVi: 'Lẩu Gà' },
      { id: 'lau_de', label: 'Lẩu Dê', labelVi: 'Lẩu Dê' },
      { id: 'nuong_bbq', label: 'Nướng BBQ', labelVi: 'Nướng BBQ' },
      { id: 'nuong_han_quoc', label: 'Nướng Hàn Quốc', labelVi: 'Nướng Hàn Quốc' },
      { id: 'nuong_viet', label: 'Nướng Việt', labelVi: 'Nướng Việt' },
    ],
  },
  {
    id: 'seafood',
    label: 'Seafood',
    labelVi: 'Hải sản',
    subcategories: [
      { id: 'tom', label: 'Shrimp', labelVi: 'Tôm' },
      { id: 'cua', label: 'Crab', labelVi: 'Cua' },
      { id: 'oc', label: 'Snails', labelVi: 'Ốc' },
      { id: 'ca', label: 'Fish', labelVi: 'Cá' },
      { id: 'muc', label: 'Squid', labelVi: 'Mực' },
      { id: 'so', label: 'Shellfish', labelVi: 'Sò/Nghêu' },
    ],
  },
  {
    id: 'bread',
    label: 'Bread',
    labelVi: 'Bánh mì',
    subcategories: [
      { id: 'banh_mi_thit', label: 'Bánh Mì Thịt', labelVi: 'Bánh Mì Thịt' },
      { id: 'banh_mi_op_la', label: 'Bánh Mì Ốp La', labelVi: 'Bánh Mì Ốp La' },
      { id: 'banh_mi_chao', label: 'Bánh Mì Chảo', labelVi: 'Bánh Mì Chảo' },
      { id: 'banh_mi_que', label: 'Bánh Mì Que', labelVi: 'Bánh Mì Que' },
    ],
  },
  {
    id: 'vietnamese_cakes',
    label: 'Vietnamese Cakes',
    labelVi: 'Bánh Việt',
    subcategories: [
      { id: 'banh_cuon', label: 'Bánh Cuốn', labelVi: 'Bánh Cuốn' },
      { id: 'banh_xeo', label: 'Bánh Xèo', labelVi: 'Bánh Xèo' },
      { id: 'banh_khot', label: 'Bánh Khọt', labelVi: 'Bánh Khọt' },
      { id: 'banh_beo', label: 'Bánh Bèo', labelVi: 'Bánh Bèo' },
      { id: 'banh_bot_loc', label: 'Bánh Bột Lọc', labelVi: 'Bánh Bột Lọc' },
      { id: 'banh_trang_nuong', label: 'Bánh Tráng Nướng', labelVi: 'Bánh Tráng Nướng' },
      { id: 'goi_cuon', label: 'Gỏi Cuốn', labelVi: 'Gỏi Cuốn' },
    ],
  },
  {
    id: 'snack',
    label: 'Snack',
    labelVi: 'Ăn vặt',
    subcategories: [
      { id: 'banh_trang_tron', label: 'Bánh Tráng Trộn', labelVi: 'Bánh Tráng Trộn' },
      { id: 'bo_bia', label: 'Bò Bía', labelVi: 'Bò Bía' },
      { id: 'khoai_chien', label: 'Khoai Chiên', labelVi: 'Khoai Chiên' },
      { id: 'bo_ne', label: 'Bò Né', labelVi: 'Bò Né' },
      { id: 'trung_vit_lon', label: 'Trứng Vịt Lộn', labelVi: 'Trứng Vịt Lộn' },
      { id: 'kho_ga', label: 'Khô Gà', labelVi: 'Khô Gà' },
    ],
  },
  {
    id: 'dessert',
    label: 'Dessert',
    labelVi: 'Tráng miệng',
    subcategories: [
      { id: 'che', label: 'Chè', labelVi: 'Chè' },
      { id: 'kem', label: 'Ice Cream', labelVi: 'Kem' },
      { id: 'banh_ngot', label: 'Pastries', labelVi: 'Bánh Ngọt' },
      { id: 'trai_cay', label: 'Fruit', labelVi: 'Trái Cây' },
      { id: 'sua_chua', label: 'Yogurt', labelVi: 'Sữa Chua' },
    ],
  },
  {
    id: 'drinks',
    label: 'Drinks',
    labelVi: 'Đồ uống',
    subcategories: [
      { id: 'ca_phe', label: 'Coffee', labelVi: 'Cà Phê' },
      { id: 'tra_sua', label: 'Milk Tea', labelVi: 'Trà Sữa' },
      { id: 'nuoc_ep', label: 'Juice', labelVi: 'Nước Ép' },
      { id: 'sinh_to', label: 'Smoothie', labelVi: 'Sinh Tố' },
      { id: 'bia', label: 'Beer', labelVi: 'Bia' },
      { id: 'ruou', label: 'Alcohol', labelVi: 'Rượu' },
    ],
  },
  {
    id: 'fast_food',
    label: 'Fast Food',
    labelVi: 'Đồ ăn nhanh',
    subcategories: [
      { id: 'burger', label: 'Burger', labelVi: 'Burger' },
      { id: 'pizza', label: 'Pizza', labelVi: 'Pizza' },
      { id: 'ga_ran', label: 'Fried Chicken', labelVi: 'Gà Rán' },
      { id: 'hot_dog', label: 'Hot Dog', labelVi: 'Hot Dog' },
      { id: 'sandwich', label: 'Sandwich', labelVi: 'Sandwich' },
    ],
  },
  {
    id: 'international',
    label: 'International Food',
    labelVi: 'Món quốc tế',
    subcategories: [
      { id: 'korean', label: 'Korean', labelVi: 'Hàn Quốc' },
      { id: 'japanese', label: 'Japanese', labelVi: 'Nhật Bản' },
      { id: 'chinese', label: 'Chinese', labelVi: 'Trung Quốc' },
      { id: 'thai', label: 'Thai', labelVi: 'Thái Lan' },
      { id: 'indian', label: 'Indian', labelVi: 'Ấn Độ' },
      { id: 'western', label: 'Western', labelVi: 'Phương Tây' },
      { id: 'italian', label: 'Italian', labelVi: 'Ý' },
      { id: 'mexican', label: 'Mexican', labelVi: 'Mexico' },
    ],
  },
  {
    id: 'healthy',
    label: 'Healthy Food',
    labelVi: 'Đồ ăn healthy',
    subcategories: [
      { id: 'salad', label: 'Salad', labelVi: 'Salad' },
      { id: 'smoothie_bowl', label: 'Smoothie Bowl', labelVi: 'Smoothie Bowl' },
      { id: 'low_carb', label: 'Low Carb', labelVi: 'Low Carb' },
      { id: 'protein', label: 'High Protein', labelVi: 'Giàu Protein' },
    ],
  },
  {
    id: 'veggie',
    label: 'Veggie',
    labelVi: 'Chay',
    subcategories: [
      { id: 'chay_viet', label: 'Vietnamese Vegetarian', labelVi: 'Chay Việt' },
      { id: 'vegan', label: 'Vegan', labelVi: 'Thuần Chay' },
      { id: 'chay_an_do', label: 'Indian Vegetarian', labelVi: 'Chay Ấn Độ' },
    ],
  },
  {
    id: 'others',
    label: 'Others',
    labelVi: 'Khác',
    subcategories: [],
  },
];

/**
 * Helper: Get all subcategory IDs for a main category
 */
export const getSubcategoryIds = (categoryId: string): string[] => {
  const category = CUISINE_MAPPING.find((c) => c.id === categoryId);
  return category?.subcategories.map((s) => s.id) ?? [];
};

/**
 * Helper: Get main category for a subcategory ID
 */
export const getParentCategory = (subcategoryId: string): CuisineCategory | undefined => {
  return CUISINE_MAPPING.find((c) => c.subcategories.some((s) => s.id === subcategoryId));
};

/**
 * Helper: Flatten all subcategories for search/filter
 */
export const getAllSubcategories = (): CuisineSubcategory[] => {
  return CUISINE_MAPPING.flatMap((c) => c.subcategories);
};

/**
 * Helper: Get flat list of main categories (for MVP)
 */
export const getMainCategories = () => {
  return CUISINE_MAPPING.map(({ id, label, labelVi }) => ({ id, label, labelVi }));
};
