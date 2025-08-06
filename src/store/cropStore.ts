
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Crop, Expense, Income, LandExpense } from '@/types/crop';

interface CropStore {
  crops: Crop[];
  landExpenses: LandExpense[];
  addCrop: (crop: Omit<Crop, 'id' | 'createdAt' | 'expenses' | 'income'>) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  addIncome: (income: Omit<Income, 'id'>) => void;
  addLandExpense: (expense: Omit<LandExpense, 'id' | 'createdAt'>) => void;
  loadCrops: () => void;
  deleteCrop: (cropId: string) => void;
  deleteExpense: (cropId: string, expenseId: string) => void;
  deleteIncome: (cropId: string, incomeId: string) => void;
  deleteLandExpense: (expenseId: string) => void;
}

export const useCropStore = create<CropStore>()(
  persist(
    (set, get) => ({
      crops: [],
      landExpenses: [],
      
      addCrop: (cropData) => {
        const newCrop: Crop = {
          ...cropData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          expenses: [],
          income: [],
        };
        set((state) => ({
          crops: [newCrop, ...state.crops],
        }));
      },

      addExpense: (expenseData) => {
        const expense: Expense = {
          ...expenseData,
          id: crypto.randomUUID(),
        };
        set((state) => ({
          crops: state.crops.map((crop) =>
            crop.id === expenseData.cropId
              ? { ...crop, expenses: [expense, ...crop.expenses] }
              : crop
          ),
        }));
      },

      addIncome: (incomeData) => {
        const income: Income = {
          ...incomeData,
          id: crypto.randomUUID(),
        };
        set((state) => ({
          crops: state.crops.map((crop) =>
            crop.id === incomeData.cropId
              ? { ...crop, income: [income, ...crop.income] }
              : crop
          ),
        }));
      },

      addLandExpense: (expenseData) => {
        const expense: LandExpense = {
          ...expenseData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          landExpenses: [expense, ...state.landExpenses],
        }));
      },

      loadCrops: () => {
        console.log('Crops loaded from localStorage');
      },

      deleteCrop: (cropId) => {
        set((state) => ({
          crops: state.crops.filter((crop) => crop.id !== cropId),
        }));
      },

      deleteExpense: (cropId, expenseId) => {
        set((state) => ({
          crops: state.crops.map((crop) =>
            crop.id === cropId
              ? {
                  ...crop,
                  expenses: crop.expenses.filter((exp) => exp.id !== expenseId),
                }
              : crop
          ),
        }));
      },

      deleteIncome: (cropId, incomeId) => {
        set((state) => ({
          crops: state.crops.map((crop) =>
            crop.id === cropId
              ? {
                  ...crop,
                  income: crop.income.filter((inc) => inc.id !== incomeId),
                }
              : crop
          ),
        }));
      },

      deleteLandExpense: (expenseId) => {
        set((state) => ({
          landExpenses: state.landExpenses.filter((exp) => exp.id !== expenseId),
        }));
      },
    }),
    {
      name: 'crop-ledger-storage',
    }
  )
);
