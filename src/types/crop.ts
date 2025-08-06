export interface Crop {
  id: string;
  name: string;
  type: CropType;
  landArea: number;
  landUnit: 'acres' | 'hectares';
  sowingDate: string;
  expenses: Expense[];
  income: Income[];
  createdAt: string;
}

export type CropType = 
  | 'Cotton' 
  | 'Rice' 
  | 'Wheat' 
  | 'Corn' 
  | 'Tomato' 
  | 'Onion' 
  | 'Potato' 
  | 'Chili' 
  | 'Brinjal' 
  | 'Okra'
  | 'Sugarcane'
  | 'Groundnut'
  | 'Sunflower'
  | 'Millets'
  | 'Other';

export const CROP_TYPE_LIST: CropType[] = [
  'Cotton',
  'Rice',
  'Wheat',
  'Corn',
  'Tomato',
  'Onion',
  'Potato',
  'Chili',
  'Brinjal',
  'Okra',
  'Sugarcane',
  'Groundnut',
  'Sunflower',
  'Millets',
  'Other',
];

export interface Expense {
  id: string;
  cropId: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description?: string;
  bill_image_url?: string[];
  order?: number;
}

export type ExpenseCategory = 
  | 'Seeds'
  | 'Sowing Labor'
  | 'Weeding Labor' 
  | 'Harvesting Labor'
  | 'Cotton Picking Labor'
  | 'Fertilizer'
  | 'Fertilizer Application Labor'
  | 'Pesticide'
  | 'Pesticide Spraying Labor'
  | 'Irrigation'
  | 'Equipment Rent'
  | 'Transportation'
  | 'Dunnakam'
  | 'Plough'
  | 'Acchulu'
  | 'Guntuka'
  | 'Other';

export interface Income {
  id: string;
  cropId: string;
  source: string;
  amount: number;
  date: string;
  description?: string;
  bill_image_url?: string[];
  order?: number;
}

export interface LandExpense {
  id: string;
  category: LandExpenseCategory;
  amount: number;
  date: string;
  description?: string;
  createdAt: string;
  bill_image_url?: string[];
  order?: number;
}

export type LandExpenseCategory = 
  | 'Pipeline Installation'
  | 'Land Leveling'
  | 'Drip System'
  | 'Sprinkler System'
  | 'Bore Well'
  | 'Fencing'
  | 'Shed Construction'
  | 'Road Development'
  | 'Electricity Connection'
  | 'Water Tank'
  | 'Other';
