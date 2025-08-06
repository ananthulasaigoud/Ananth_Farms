import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { Crop, Expense, Income, LandExpense, CropType, ExpenseCategory, LandExpenseCategory } from '@/types/crop';

interface CropStore {
  crops: Crop[];
  landExpenses: LandExpense[];
  loading: boolean;
  addCrop: (crop: Omit<Crop, 'id' | 'createdAt' | 'expenses' | 'income'>) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  addIncome: (income: Omit<Income, 'id'>) => Promise<void>;
  addLandExpense: (expense: Omit<LandExpense, 'id' | 'createdAt'>) => Promise<void>;
  editCrop: (cropId: string, cropData: Partial<Omit<Crop, 'id' | 'createdAt' | 'expenses' | 'income'>>) => Promise<void>;
  editExpense: (expenseId: string, expenseData: Partial<Omit<Expense, 'id' | 'cropId'>>) => Promise<void>;
  editIncome: (incomeId: string, incomeData: Partial<Omit<Income, 'id' | 'cropId'>>) => Promise<void>;
  editLandExpense: (expenseId: string, expenseData: Partial<Omit<LandExpense, 'id' | 'createdAt'>>) => Promise<void>;
  loadCrops: () => Promise<void>;
  loadLandExpenses: () => Promise<void>;
  refreshCropData: () => Promise<void>;
  deleteCrop: (cropId: string) => Promise<void>;
  deleteExpense: (cropId: string, expenseId: string) => Promise<void>;
  deleteIncome: (cropId: string, incomeId: string) => Promise<void>;
  deleteLandExpense: (expenseId: string) => Promise<void>;
  reorderExpense: (cropId: string, expenseId: string, newOrder: number) => Promise<void>;
  reorderIncome: (cropId: string, incomeId: string, newOrder: number) => Promise<void>;
}

export const useCropStore = create<CropStore>()((set, get) => ({
  crops: [],
  landExpenses: [],
  loading: false,

  addCrop: async (cropData) => {
    set({ loading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('crops')
        .insert({
          name: cropData.name,
          type: cropData.type,
          land_area: cropData.landArea,
          land_unit: cropData.landUnit,
          sowing_date: cropData.sowingDate,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      const newCrop: Crop = {
        id: data.id,
        name: data.name,
        type: data.type as CropType,
        landArea: data.land_area,
        landUnit: data.land_unit as 'acres' | 'hectares',
        sowingDate: data.sowing_date,
        createdAt: data.created_at,
        expenses: [],
        income: [],
      };

      set((state) => ({
        crops: [newCrop, ...state.crops],
        loading: false,
      }));
    } catch (error) {
      console.error('Error adding crop:', error);
      set({ loading: false });
      throw error;
    }
  },

  editCrop: async (cropId, cropData) => {
    set({ loading: true });
    try {
      const updateData: any = {};
      if (cropData.name) updateData.name = cropData.name;
      if (cropData.type) updateData.type = cropData.type;
      if (cropData.landArea) updateData.land_area = cropData.landArea;
      if (cropData.landUnit) updateData.land_unit = cropData.landUnit;
      if (cropData.sowingDate) updateData.sowing_date = cropData.sowingDate;

      const { data, error } = await supabase
        .from('crops')
        .update(updateData)
        .eq('id', cropId)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        crops: state.crops.map((crop) =>
          crop.id === cropId
            ? {
                ...crop,
                name: data.name,
                type: data.type as CropType,
                landArea: data.land_area,
                landUnit: data.land_unit as 'acres' | 'hectares',
                sowingDate: data.sowing_date,
              }
            : crop
        ),
        loading: false,
      }));
    } catch (error) {
      console.error('Error editing crop:', error);
      set({ loading: false });
      throw error;
    }
  },

  addExpense: async (expenseData) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          crop_id: expenseData.cropId,
          category: expenseData.category,
          amount: expenseData.amount,
          date: expenseData.date,
          description: expenseData.description,
          bill_image_url: expenseData.bill_image_url,
        })
        .select()
        .single();

      if (error) throw error;

      const expense: Expense = {
        id: data.id,
        cropId: data.crop_id,
        category: data.category as ExpenseCategory,
        amount: data.amount,
        date: data.date,
        description: data.description,
        bill_image_url: data.bill_image_url,
      };

      set((state) => ({
        crops: state.crops.map((crop) =>
          crop.id === expenseData.cropId
            ? { ...crop, expenses: [expense, ...crop.expenses] }
            : crop
        ),
        loading: false,
      }));
    } catch (error) {
      console.error('Error adding expense:', error);
      set({ loading: false });
      throw error;
    }
  },

  editExpense: async (expenseId, expenseData) => {
    set({ loading: true });
    try {
      const updateData: any = {};
      if (expenseData.category) updateData.category = expenseData.category;
      if (expenseData.amount) updateData.amount = expenseData.amount;
      if (expenseData.date) updateData.date = expenseData.date;
      if (expenseData.description !== undefined) updateData.description = expenseData.description;
      if (expenseData.bill_image_url !== undefined) updateData.bill_image_url = expenseData.bill_image_url;

      console.log('Updating expense with data:', updateData);

      const { data, error } = await supabase
        .from('expenses')
        .update(updateData)
        .eq('id', expenseId)
        .select()
        .single();

      if (error) throw error;

      console.log('Database response:', data);

      set((state) => {
        const updatedState = {
        crops: state.crops.map((crop) => ({
          ...crop,
          expenses: crop.expenses.map((expense) =>
            expense.id === expenseId
              ? {
                  ...expense,
                  category: data.category as ExpenseCategory,
                  amount: data.amount,
                  date: data.date,
                  description: data.description,
                    bill_image_url: data.bill_image_url || [],
                }
              : expense
          ),
        })),
        loading: false,
        };
        console.log('Updated store state:', updatedState);
        return updatedState;
      });
    } catch (error) {
      console.error('Error editing expense:', error);
      set({ loading: false });
      throw error;
    }
  },

  addIncome: async (incomeData) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('income')
        .insert({
          crop_id: incomeData.cropId,
          source: incomeData.source,
          amount: incomeData.amount,
          date: incomeData.date,
          description: incomeData.description,
          bill_image_url: incomeData.bill_image_url,
        })
        .select()
        .single();

      if (error) throw error;

      const income: Income = {
        id: data.id,
        cropId: data.crop_id,
        source: data.source,
        amount: data.amount,
        date: data.date,
        description: data.description,
        bill_image_url: data.bill_image_url,
      };

      set((state) => ({
        crops: state.crops.map((crop) =>
          crop.id === incomeData.cropId
            ? { ...crop, income: [income, ...crop.income] }
            : crop
        ),
        loading: false,
      }));
    } catch (error) {
      console.error('Error adding income:', error);
      set({ loading: false });
      throw error;
    }
  },

  editIncome: async (incomeId, incomeData) => {
    set({ loading: true });
    try {
      const updateData: any = {};
      if (incomeData.source) updateData.source = incomeData.source;
      if (incomeData.amount) updateData.amount = incomeData.amount;
      if (incomeData.date) updateData.date = incomeData.date;
      if (incomeData.description !== undefined) updateData.description = incomeData.description;
      if (incomeData.bill_image_url !== undefined) updateData.bill_image_url = incomeData.bill_image_url;

      console.log('Updating income with data:', updateData);

      const { data, error } = await supabase
        .from('income')
        .update(updateData)
        .eq('id', incomeId)
        .select()
        .single();

      if (error) throw error;

      console.log('Database response:', data);

      set((state) => {
        const updatedState = {
        crops: state.crops.map((crop) => ({
          ...crop,
          income: crop.income.map((income) =>
            income.id === incomeId
              ? {
                  ...income,
                  source: data.source,
                  amount: data.amount,
                  date: data.date,
                  description: data.description,
                    bill_image_url: data.bill_image_url || [],
                }
              : income
          ),
        })),
        loading: false,
        };
        console.log('Updated store state:', updatedState);
        return updatedState;
      });
    } catch (error) {
      console.error('Error editing income:', error);
      set({ loading: false });
      throw error;
    }
  },

  addLandExpense: async (expenseData) => {
    set({ loading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('land_expenses')
        .insert({
          category: expenseData.category,
          amount: expenseData.amount,
          date: expenseData.date,
          description: expenseData.description,
          bill_image_url: expenseData.bill_image_url,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      const expense: LandExpense = {
        id: data.id,
        category: data.category as LandExpenseCategory,
        amount: data.amount,
        date: data.date,
        description: data.description,
        bill_image_url: data.bill_image_url,
        createdAt: data.created_at,
      };

      set((state) => ({
        landExpenses: [expense, ...state.landExpenses],
        loading: false,
      }));
    } catch (error) {
      console.error('Error adding land expense:', error);
      set({ loading: false });
      throw error;
    }
  },

  editLandExpense: async (expenseId, expenseData) => {
    set({ loading: true });
    try {
      const updateData: any = {};
      if (expenseData.category) updateData.category = expenseData.category;
      if (expenseData.amount) updateData.amount = expenseData.amount;
      if (expenseData.date) updateData.date = expenseData.date;
      if (expenseData.description !== undefined) updateData.description = expenseData.description;
      if (expenseData.bill_image_url !== undefined) updateData.bill_image_url = expenseData.bill_image_url;

      const { data, error } = await supabase
        .from('land_expenses')
        .update(updateData)
        .eq('id', expenseId)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        landExpenses: state.landExpenses.map((expense) =>
          expense.id === expenseId
            ? {
                ...expense,
                category: data.category as LandExpenseCategory,
                amount: data.amount,
                date: data.date,
                description: data.description,
                bill_image_url: data.bill_image_url,
              }
            : expense
        ),
        loading: false,
      }));
    } catch (error) {
      console.error('Error editing land expense:', error);
      set({ loading: false });
      throw error;
    }
  },

  loadCrops: async () => {
    set({ loading: true });
    try {
      const { data: cropsData, error } = await supabase
        .from('crops')
        .select(`
          *,
          expenses(*),
          income(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const crops: Crop[] = (cropsData || []).map((crop) => ({
        id: crop.id,
        name: crop.name,
        type: crop.type as CropType,
        landArea: crop.land_area,
        landUnit: crop.land_unit as 'acres' | 'hectares',
        sowingDate: crop.sowing_date,
        createdAt: crop.created_at,
        expenses: (crop.expenses || []).map((exp: any) => ({
          id: exp.id,
          cropId: exp.crop_id,
          category: exp.category as ExpenseCategory,
          amount: exp.amount,
          date: exp.date,
          description: exp.description,
          bill_image_url: exp.bill_image_url,
        })),
        income: (crop.income || []).map((inc: any) => ({
          id: inc.id,
          cropId: inc.crop_id,
          source: inc.source,
          amount: inc.amount,
          date: inc.date,
          description: inc.description,
          bill_image_url: inc.bill_image_url,
        })),
      }));

      set({ crops, loading: false });
    } catch (error) {
      console.error('Error loading crops:', error);
      set({ loading: false });
    }
  },

  loadLandExpenses: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('land_expenses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const landExpenses: LandExpense[] = (data || []).map((exp) => ({
        id: exp.id,
        category: exp.category as LandExpenseCategory,
        amount: exp.amount,
        date: exp.date,
        description: exp.description,
        bill_image_url: exp.bill_image_url,
        createdAt: exp.created_at,
      }));

      set({ landExpenses, loading: false });
    } catch (error) {
      console.error('Error loading land expenses:', error);
      set({ loading: false });
    }
  },

  deleteCrop: async (cropId) => {
    set({ loading: true });
    try {
      const { error } = await supabase
        .from('crops')
        .delete()
        .eq('id', cropId);

      if (error) throw error;

      set((state) => ({
        crops: state.crops.filter((crop) => crop.id !== cropId),
        loading: false,
      }));
    } catch (error) {
      console.error('Error deleting crop:', error);
      set({ loading: false });
      throw error;
    }
  },

  deleteExpense: async (cropId, expenseId) => {
    set({ loading: true });
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);

      if (error) throw error;

      set((state) => ({
        crops: state.crops.map((crop) =>
          crop.id === cropId
            ? {
                ...crop,
                expenses: crop.expenses.filter((exp) => exp.id !== expenseId),
              }
            : crop
        ),
        loading: false,
      }));
    } catch (error) {
      console.error('Error deleting expense:', error);
      set({ loading: false });
      throw error;
    }
  },

  deleteIncome: async (cropId, incomeId) => {
    set({ loading: true });
    try {
      const { error } = await supabase
        .from('income')
        .delete()
        .eq('id', incomeId);

      if (error) throw error;

      set((state) => ({
        crops: state.crops.map((crop) =>
          crop.id === cropId
            ? {
                ...crop,
                income: crop.income.filter((inc) => inc.id !== incomeId),
              }
            : crop
        ),
        loading: false,
      }));
    } catch (error) {
      console.error('Error deleting income:', error);
      set({ loading: false });
      throw error;
    }
  },

  deleteLandExpense: async (expenseId) => {
    set({ loading: true });
    try {
      const { error } = await supabase
        .from('land_expenses')
        .delete()
        .eq('id', expenseId);

      if (error) throw error;

      set((state) => ({
        landExpenses: state.landExpenses.filter((exp) => exp.id !== expenseId),
        loading: false,
      }));
    } catch (error) {
      console.error('Error deleting land expense:', error);
      set({ loading: false });
      throw error;
    }
  },

  refreshCropData: async () => {
    set({ loading: true });
    try {
      await get().loadCrops();
      await get().loadLandExpenses();
      set({ loading: false });
    } catch (error) {
      console.error('Error refreshing crop data:', error);
      set({ loading: false });
    }
  },

  reorderExpense: async (cropId, expenseId, newOrder) => {
    await supabase.from('expenses').update({ order: newOrder }).eq('id', expenseId);
  },

  reorderIncome: async (cropId, incomeId, newOrder) => {
    await supabase.from('income').update({ order: newOrder }).eq('id', incomeId);
  },
}));
