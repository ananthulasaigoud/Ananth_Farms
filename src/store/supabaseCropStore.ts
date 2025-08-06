import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { Crop, Expense, Income, LandExpense, CropType, ExpenseCategory, LandExpenseCategory, PaymentInfo, PaymentStatus, PaymentMethod } from '@/types/crop';

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
  // Payment management methods
  updatePaymentStatus: (type: 'expense' | 'income' | 'land_expense', id: string, paymentInfo: PaymentInfo) => Promise<void>;
  getPaymentSummary: () => {
    totalUnpaid: number;
    totalPartial: number;
    totalPaid: number;
    overduePayments: Expense[];
  };
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
                ...cropData,
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
          order: expenseData.order,
          payment_status: expenseData.paymentStatus || 'unpaid',
          paid_amount: expenseData.paidAmount || 0,
          payment_date: expenseData.paymentDate,
          payment_method: expenseData.paymentMethod,
          payment_notes: expenseData.paymentNotes,
        })
        .select()
        .single();

      if (error) throw error;

      const newExpense: Expense = {
        id: data.id,
        cropId: data.crop_id,
        category: data.category as ExpenseCategory,
        amount: data.amount,
        date: data.date,
        description: data.description,
        bill_image_url: data.bill_image_url,
        order: data.order,
        paymentStatus: (data.payment_status || 'unpaid') as PaymentStatus,
        paidAmount: data.paid_amount || 0,
        paymentDate: data.payment_date,
        paymentMethod: data.payment_method as PaymentMethod,
        paymentNotes: data.payment_notes,
      };

      set((state) => ({
        crops: state.crops.map((crop) =>
          crop.id === expenseData.cropId
            ? {
                ...crop,
                expenses: [newExpense, ...crop.expenses],
              }
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
          order: incomeData.order,
          payment_status: incomeData.paymentStatus || 'paid',
          paid_amount: incomeData.paidAmount || incomeData.amount,
          payment_date: incomeData.paymentDate,
          payment_method: incomeData.paymentMethod,
          payment_notes: incomeData.paymentNotes,
        })
        .select()
        .single();

      if (error) throw error;

      const newIncome: Income = {
        id: data.id,
        cropId: data.crop_id,
        source: data.source,
        amount: data.amount,
        date: data.date,
        description: data.description,
        bill_image_url: data.bill_image_url,
        order: data.order,
        paymentStatus: (data.payment_status || 'paid') as PaymentStatus,
        paidAmount: data.paid_amount || data.amount,
        paymentDate: data.payment_date,
        paymentMethod: data.payment_method as PaymentMethod,
        paymentNotes: data.payment_notes,
      };

      set((state) => ({
        crops: state.crops.map((crop) =>
          crop.id === incomeData.cropId
            ? {
                ...crop,
                income: [newIncome, ...crop.income],
              }
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
          order: expenseData.order,
          user_id: user.id,
          payment_status: expenseData.paymentStatus || 'unpaid',
          paid_amount: expenseData.paidAmount || 0,
          payment_date: expenseData.paymentDate,
          payment_method: expenseData.paymentMethod,
          payment_notes: expenseData.paymentNotes,
        })
        .select()
        .single();

      if (error) throw error;

      const newLandExpense: LandExpense = {
        id: data.id,
        category: data.category as LandExpenseCategory,
        amount: data.amount,
        date: data.date,
        description: data.description,
        createdAt: data.created_at,
        bill_image_url: data.bill_image_url,
        order: data.order,
        paymentStatus: (data.payment_status || 'unpaid') as PaymentStatus,
        paidAmount: data.paid_amount || 0,
        paymentDate: data.payment_date,
        paymentMethod: data.payment_method as PaymentMethod,
        paymentNotes: data.payment_notes,
      };

      set((state) => ({
        landExpenses: [newLandExpense, ...state.landExpenses],
        loading: false,
      }));
    } catch (error) {
      console.error('Error adding land expense:', error);
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
      if (expenseData.bill_image_url) updateData.bill_image_url = expenseData.bill_image_url;
      if (expenseData.order !== undefined) updateData.order = expenseData.order;
      if (expenseData.paymentStatus) updateData.payment_status = expenseData.paymentStatus;
      if (expenseData.paidAmount !== undefined) updateData.paid_amount = expenseData.paidAmount;
      if (expenseData.paymentDate) updateData.payment_date = expenseData.paymentDate;
      if (expenseData.paymentMethod) updateData.payment_method = expenseData.paymentMethod;
      if (expenseData.paymentNotes !== undefined) updateData.payment_notes = expenseData.paymentNotes;

      const { data, error } = await supabase
        .from('expenses')
        .update(updateData)
        .eq('id', expenseId)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        crops: state.crops.map((crop) => ({
          ...crop,
          expenses: crop.expenses.map((expense) =>
            expense.id === expenseId
              ? {
                  ...expense,
                  ...expenseData,
                  paymentStatus: (data.payment_status || expense.paymentStatus) as PaymentStatus,
                  paidAmount: data.paid_amount || expense.paidAmount,
                  paymentDate: data.payment_date || expense.paymentDate,
                  paymentMethod: (data.payment_method || expense.paymentMethod) as PaymentMethod,
                  paymentNotes: data.payment_notes || expense.paymentNotes,
                }
              : expense
          ),
        })),
        loading: false,
      }));
    } catch (error) {
      console.error('Error editing expense:', error);
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
      if (incomeData.bill_image_url) updateData.bill_image_url = incomeData.bill_image_url;
      if (incomeData.order !== undefined) updateData.order = incomeData.order;
      if (incomeData.paymentStatus) updateData.payment_status = incomeData.paymentStatus;
      if (incomeData.paidAmount !== undefined) updateData.paid_amount = incomeData.paidAmount;
      if (incomeData.paymentDate) updateData.payment_date = incomeData.paymentDate;
      if (incomeData.paymentMethod) updateData.payment_method = incomeData.paymentMethod;
      if (incomeData.paymentNotes !== undefined) updateData.payment_notes = incomeData.paymentNotes;

      const { data, error } = await supabase
        .from('income')
        .update(updateData)
        .eq('id', incomeId)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        crops: state.crops.map((crop) => ({
          ...crop,
          income: crop.income.map((income) =>
            income.id === incomeId
              ? {
                  ...income,
                  ...incomeData,
                  paymentStatus: (data.payment_status || income.paymentStatus) as PaymentStatus,
                  paidAmount: data.paid_amount || income.paidAmount,
                  paymentDate: data.payment_date || income.paymentDate,
                  paymentMethod: (data.payment_method || income.paymentMethod) as PaymentMethod,
                  paymentNotes: data.payment_notes || income.paymentNotes,
                }
              : income
          ),
        })),
        loading: false,
      }));
    } catch (error) {
      console.error('Error editing income:', error);
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
      if (expenseData.bill_image_url) updateData.bill_image_url = expenseData.bill_image_url;
      if (expenseData.order !== undefined) updateData.order = expenseData.order;
      if (expenseData.paymentStatus) updateData.payment_status = expenseData.paymentStatus;
      if (expenseData.paidAmount !== undefined) updateData.paid_amount = expenseData.paidAmount;
      if (expenseData.paymentDate) updateData.payment_date = expenseData.paymentDate;
      if (expenseData.paymentMethod) updateData.payment_method = expenseData.paymentMethod;
      if (expenseData.paymentNotes !== undefined) updateData.payment_notes = expenseData.paymentNotes;

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
                ...expenseData,
                paymentStatus: (data.payment_status || expense.paymentStatus) as PaymentStatus,
                paidAmount: data.paid_amount || expense.paidAmount,
                paymentDate: data.payment_date || expense.paymentDate,
                paymentMethod: (data.payment_method || expense.paymentMethod) as PaymentMethod,
                paymentNotes: data.payment_notes || expense.paymentNotes,
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ loading: false });
        return;
      }

      const { data: cropsData, error: cropsError } = await supabase
        .from('crops')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (cropsError) throw cropsError;

      const cropsWithData = await Promise.all(
        cropsData.map(async (crop) => {
          // Load expenses for this crop
          const { data: expensesData, error: expensesError } = await supabase
            .from('expenses')
            .select('*')
            .eq('crop_id', crop.id)
            .order('order', { ascending: true });

          if (expensesError) throw expensesError;

          const expenses: Expense[] = expensesData.map((expense) => ({
            id: expense.id,
            cropId: expense.crop_id,
            category: expense.category as ExpenseCategory,
            amount: expense.amount,
            date: expense.date,
            description: expense.description,
            bill_image_url: expense.bill_image_url,
            order: expense.order,
            paymentStatus: (expense.payment_status || 'unpaid') as PaymentStatus,
            paidAmount: expense.paid_amount || 0,
            paymentDate: expense.payment_date,
            paymentMethod: expense.payment_method as PaymentMethod,
            paymentNotes: expense.payment_notes,
          }));

          // Load income for this crop
          const { data: incomeData, error: incomeError } = await supabase
            .from('income')
            .select('*')
            .eq('crop_id', crop.id)
            .order('order', { ascending: true });

          if (incomeError) throw incomeError;

          const income: Income[] = incomeData.map((inc) => ({
            id: inc.id,
            cropId: inc.crop_id,
            source: inc.source,
            amount: inc.amount,
            date: inc.date,
            description: inc.description,
            bill_image_url: inc.bill_image_url,
            order: inc.order,
            paymentStatus: (inc.payment_status || 'paid') as PaymentStatus,
            paidAmount: inc.paid_amount || inc.amount,
            paymentDate: inc.payment_date,
            paymentMethod: inc.payment_method as PaymentMethod,
            paymentNotes: inc.payment_notes,
          }));

          return {
            id: crop.id,
            name: crop.name,
            type: crop.type as CropType,
            landArea: crop.land_area,
            landUnit: crop.land_unit as 'acres' | 'hectares',
            sowingDate: crop.sowing_date,
            createdAt: crop.created_at,
            expenses,
            income,
          };
        })
      );

      set({ crops: cropsWithData, loading: false });
    } catch (error) {
      console.error('Error loading crops:', error);
      set({ loading: false });
    }
  },

  loadLandExpenses: async () => {
    set({ loading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ loading: false });
        return;
      }

      const { data, error } = await supabase
        .from('land_expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const landExpenses: LandExpense[] = data.map((expense) => ({
        id: expense.id,
        category: expense.category as LandExpenseCategory,
        amount: expense.amount,
        date: expense.date,
        description: expense.description,
        createdAt: expense.created_at,
        bill_image_url: expense.bill_image_url,
        order: expense.order,
        paymentStatus: (expense.payment_status || 'unpaid') as PaymentStatus,
        paidAmount: expense.paid_amount || 0,
        paymentDate: expense.payment_date,
        paymentMethod: expense.payment_method as PaymentMethod,
        paymentNotes: expense.payment_notes,
      }));

      set({ landExpenses, loading: false });
    } catch (error) {
      console.error('Error loading land expenses:', error);
      set({ loading: false });
    }
  },

  refreshCropData: async () => {
    await get().loadCrops();
    await get().loadLandExpenses();
  },

  deleteCrop: async (cropId) => {
    set({ loading: true });
    try {
      const { error } = await supabase.from('crops').delete().eq('id', cropId);
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
      const { error } = await supabase.from('expenses').delete().eq('id', expenseId);
      if (error) throw error;

      set((state) => ({
        crops: state.crops.map((crop) =>
          crop.id === cropId
            ? {
                ...crop,
                expenses: crop.expenses.filter((expense) => expense.id !== expenseId),
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
      const { error } = await supabase.from('income').delete().eq('id', incomeId);
      if (error) throw error;

      set((state) => ({
        crops: state.crops.map((crop) =>
          crop.id === cropId
            ? {
                ...crop,
                income: crop.income.filter((income) => income.id !== incomeId),
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
      const { error } = await supabase.from('land_expenses').delete().eq('id', expenseId);
      if (error) throw error;

      set((state) => ({
        landExpenses: state.landExpenses.filter((expense) => expense.id !== expenseId),
        loading: false,
      }));
    } catch (error) {
      console.error('Error deleting land expense:', error);
      set({ loading: false });
      throw error;
    }
  },

  reorderExpense: async (cropId, expenseId, newOrder) => {
    try {
      await supabase.from('expenses').update({ order: newOrder }).eq('id', expenseId);
    } catch (error) {
      console.error('Error reordering expense:', error);
    }
  },

  reorderIncome: async (cropId, incomeId, newOrder) => {
    try {
      await supabase.from('income').update({ order: newOrder }).eq('id', incomeId);
    } catch (error) {
      console.error('Error reordering income:', error);
    }
  },

  // Payment management methods
  updatePaymentStatus: async (type, id, paymentInfo) => {
    set({ loading: true });
    try {
      let updateData: any = {
        payment_status: paymentInfo.status,
        paid_amount: paymentInfo.paidAmount,
        payment_date: paymentInfo.paymentDate,
        payment_method: paymentInfo.paymentMethod,
        payment_notes: paymentInfo.paymentNotes,
      };

      let data: any;
      let error: any;

      if (type === 'expense') {
        const result = await supabase
          .from('expenses')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
        data = result.data;
        error = result.error;
      } else if (type === 'income') {
        const result = await supabase
          .from('income')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
        data = result.data;
        error = result.error;
      } else if (type === 'land_expense') {
        const result = await supabase
          .from('land_expenses')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
        data = result.data;
        error = result.error;
      } else {
        throw new Error('Invalid type');
      }

      if (error) throw error;

      // Update local state
      if (type === 'expense') {
        set((state) => ({
          crops: state.crops.map((crop) => ({
            ...crop,
            expenses: crop.expenses.map((expense) =>
              expense.id === id
                ? {
                    ...expense,
                    paymentStatus: paymentInfo.status,
                    paidAmount: paymentInfo.paidAmount,
                    paymentDate: paymentInfo.paymentDate,
                    paymentMethod: paymentInfo.paymentMethod,
                    paymentNotes: paymentInfo.paymentNotes,
                  }
                : expense
            ),
          })),
          loading: false,
        }));
      } else if (type === 'income') {
        set((state) => ({
          crops: state.crops.map((crop) => ({
            ...crop,
            income: crop.income.map((income) =>
              income.id === id
                ? {
                    ...income,
                    paymentStatus: paymentInfo.status,
                    paidAmount: paymentInfo.paidAmount,
                    paymentDate: paymentInfo.paymentDate,
                    paymentMethod: paymentInfo.paymentMethod,
                    paymentNotes: paymentInfo.paymentNotes,
                  }
                : income
            ),
          })),
          loading: false,
        }));
      } else if (type === 'land_expense') {
        set((state) => ({
          landExpenses: state.landExpenses.map((expense) =>
            expense.id === id
              ? {
                  ...expense,
                  paymentStatus: paymentInfo.status,
                  paidAmount: paymentInfo.paidAmount,
                  paymentDate: paymentInfo.paymentDate,
                  paymentMethod: paymentInfo.paymentMethod,
                  paymentNotes: paymentInfo.paymentNotes,
                }
              : expense
          ),
          loading: false,
        }));
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      set({ loading: false });
      throw error;
    }
  },

  getPaymentSummary: () => {
    const allExpenses = get().crops.flatMap(crop => crop.expenses);
    const allLandExpenses = get().landExpenses;
    const allItems = [...allExpenses, ...allLandExpenses];

    const unpaidItems = allItems.filter(item => item.paymentStatus === 'unpaid');
    const partialItems = allItems.filter(item => item.paymentStatus === 'partial');
    const paidItems = allItems.filter(item => item.paymentStatus === 'paid');

    const overduePayments = allItems.filter(item => {
      const itemDate = new Date(item.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return item.paymentStatus === 'unpaid' && itemDate < thirtyDaysAgo;
    });

    return {
      totalUnpaid: unpaidItems.reduce((sum, item) => sum + item.amount, 0),
      totalPartial: partialItems.reduce((sum, item) => sum + (item.amount - item.paidAmount), 0),
      totalPaid: paidItems.reduce((sum, item) => sum + item.paidAmount, 0),
      overduePayments: overduePayments as Expense[],
    };
  },
}));
