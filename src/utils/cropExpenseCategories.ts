import { CropType, ExpenseCategory } from '@/types/crop';

export const getCropSpecificExpenseCategories = (cropType: CropType): ExpenseCategory[] => {
  const commonCategories: ExpenseCategory[] = [
    'Seeds',
    'Sowing Labor',
    'Weeding Labor',
    'Fertilizer',
    'Fertilizer Application Labor',
    'Pesticide',
    'Pesticide Spraying Labor',
    'Irrigation',
    'Equipment Rent',
    'Transportation',
    'Other'
  ];

  const cropSpecificCategories: Record<CropType, ExpenseCategory[]> = {
    'Cotton': [
      ...commonCategories,
      'Cotton Picking Labor',
    ],
    'Rice': [
      ...commonCategories,
      'Harvesting Labor',
    ],
    'Wheat': [
      ...commonCategories,
      'Harvesting Labor',
    ],
    'Corn': [
      ...commonCategories,
      'Harvesting Labor',
    ],
    'Tomato': [
      ...commonCategories,
      'Harvesting Labor',
    ],
    'Onion': [
      ...commonCategories,
      'Harvesting Labor',
    ],
    'Potato': [
      ...commonCategories,
      'Harvesting Labor',
    ],
    'Chili': [
      ...commonCategories,
      'Harvesting Labor',
    ],
    'Brinjal': [
      ...commonCategories,
      'Harvesting Labor',
    ],
    'Okra': [
      ...commonCategories,
      'Harvesting Labor',
    ],
    'Sugarcane': [
      ...commonCategories,
      'Harvesting Labor',
    ],
    'Groundnut': [
      ...commonCategories,
      'Harvesting Labor',
    ],
    'Sunflower': [
      ...commonCategories,
      'Harvesting Labor',
    ],
    'Millets': [
      ...commonCategories,
      'Harvesting Labor',
    ],
    'Other': commonCategories,
  };

  return cropSpecificCategories[cropType] || commonCategories;
};

export const getExpenseCategoryIcon = (category: ExpenseCategory): string => {
  const icons: Record<ExpenseCategory, string> = {
    'Seeds': '🌱',
    'Sowing Labor': '👨‍🌾',
    'Weeding Labor': '🌿',
    'Harvesting Labor': '🌾',
    'Cotton Picking Labor': '🤏',
    'Fertilizer': '🧪',
    'Fertilizer Application Labor': '💊',
    'Pesticide': '🚿',
    'Pesticide Spraying Labor': '💨',
    'Irrigation': '💧',
    'Equipment Rent': '🚜',
    'Transportation': '🚛',
    'Other': '📋',
  };
  return icons[category] || '📋';
};

export const getLandExpenseCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    'Pipeline Installation': '🔧',
    'Land Leveling': '🏗️',
    'Drip System': '💧',
    'Sprinkler System': '🌧️',
    'Bore Well': '🕳️',
    'Fencing': '🚧',
    'Shed Construction': '🏠',
    'Road Development': '🛣️',
    'Electricity Connection': '⚡',
    'Water Tank': '🪣',
    'Other': '📋',
  };
  return icons[category] || '📋';
};

export const ALL_EXPENSE_CATEGORIES = [
  'Seeds',
  'Sowing Labor',
  'Weeding Labor',
  'Harvesting Labor',
  'Cotton Picking Labor',
  'Fertilizer',
  'Fertilizer Application Labor',
  'Pesticide',
  'Pesticide Spraying Labor',
  'Irrigation',
  'Equipment Rent',
  'Transportation',
  'Dunnakam',
  'Plough',
  'Acchulu',
  'Guntuka',
  'Other',
];
