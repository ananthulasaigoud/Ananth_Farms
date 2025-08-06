import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCropStore } from '@/store/supabaseCropStore';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const useRealTimeData = (autoRefresh = true, refreshInterval = 30000) => {
  const { user } = useAuth();
  const { loadCrops, loadLandExpenses, refreshCropData } = useCropStore();
  const subscriptions = useRef<any[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) return;

    // Subscribe to crops table changes
    const cropsSubscription = supabase
      .channel('crops-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'crops',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Crops change detected:', payload);
          loadCrops();
          
          // Show toast for real-time updates
          if (payload.eventType === 'INSERT') {
            toast.success('New crop added!', {
              description: 'Your farm data has been updated in real-time.',
            });
          } else if (payload.eventType === 'UPDATE') {
            toast.info('Crop updated!', {
              description: 'Your farm data has been updated in real-time.',
            });
          } else if (payload.eventType === 'DELETE') {
            toast.warning('Crop removed!', {
              description: 'Your farm data has been updated in real-time.',
            });
          }
        }
      )
      .subscribe();

    // Subscribe to expenses table changes
    const expensesSubscription = supabase
      .channel('expenses-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
        },
        (payload) => {
          console.log('Expenses change detected:', payload);
          loadCrops();
          
          if (payload.eventType === 'INSERT') {
            toast.success('New expense added!', {
              description: 'Your farm data has been updated in real-time.',
            });
          }
        }
      )
      .subscribe();

    // Subscribe to income table changes
    const incomeSubscription = supabase
      .channel('income-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'income',
        },
        (payload) => {
          console.log('Income change detected:', payload);
          loadCrops();
          
          if (payload.eventType === 'INSERT') {
            toast.success('New income added!', {
              description: 'Your farm data has been updated in real-time.',
            });
          }
        }
      )
      .subscribe();

    // Subscribe to land expenses table changes
    const landExpensesSubscription = supabase
      .channel('land-expenses-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'land_expenses',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Land expenses change detected:', payload);
          loadLandExpenses();
          
          if (payload.eventType === 'INSERT') {
            toast.success('New land expense added!', {
              description: 'Your farm data has been updated in real-time.',
            });
          }
        }
      )
      .subscribe();

    subscriptions.current = [
      cropsSubscription,
      expensesSubscription,
      incomeSubscription,
      landExpensesSubscription,
    ];

    return () => {
      subscriptions.current.forEach((subscription) => {
        supabase.removeChannel(subscription);
      });
    };
  }, [user, loadCrops, loadLandExpenses]);

  useEffect(() => {
    if (autoRefresh) {
      // Set up interval for automatic refresh
      intervalRef.current = setInterval(() => {
        refreshCropData();
      }, refreshInterval);

      // Cleanup on unmount
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, refreshCropData]);

  const forceRefresh = async () => {
    await refreshCropData();
  };

  return {
    isConnected: subscriptions.current.length > 0,
    forceRefresh,
  };
}; 