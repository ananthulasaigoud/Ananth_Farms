import { useEffect, useState } from 'react';
import { useCropStore } from '@/store/supabaseCropStore';
import { toast } from 'sonner';
import { Crop } from '@/types/crop';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export const useNotifications = () => {
  const { crops, landExpenses } = useCropStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Check for harvest season approaching
  const checkHarvestSeason = () => {
    const now = new Date();
    const harvestNotifications = crops
      .filter(crop => {
        const sowingDate = new Date(crop.sowingDate);
        const daysSinceSowing = Math.floor((now.getTime() - sowingDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Different crops have different harvest periods (simplified)
        const harvestPeriods: Record<string, number> = {
          'Rice': 120,
          'Wheat': 150,
          'Corn': 90,
          'Cotton': 180,
          'Tomato': 80,
          'Onion': 100,
          'Potato': 120,
          'Chili': 90,
          'Brinjal': 70,
          'Okra': 60,
          'Sugarcane': 365,
          'Groundnut': 120,
          'Sunflower': 100,
          'Millets': 90,
          'Other': 120,
        };
        
        const harvestDays = harvestPeriods[crop.type] || 120;
        const daysUntilHarvest = harvestDays - daysSinceSowing;
        
        return daysUntilHarvest > 0 && daysUntilHarvest <= 30;
      })
      .map(crop => ({
        id: `harvest-${crop.id}`,
        type: 'warning' as const,
        title: 'Harvest Season Approaching',
        message: `${crop.name} (${crop.type}) will be ready for harvest soon.`,
        timestamp: new Date(),
        read: false,
      }));
    
    return harvestNotifications;
  };

  // Check for low profit crops
  const checkLowProfitCrops = () => {
    const lowProfitThreshold = -5000; // ₹5000 loss threshold
    
    const lowProfitNotifications = crops
      .filter(crop => {
        const income = crop.income.reduce((sum, inc) => sum + inc.amount, 0);
        const expenses = crop.expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const profit = income - expenses;
        return profit < lowProfitThreshold;
      })
      .map(crop => {
        const income = crop.income.reduce((sum, inc) => sum + inc.amount, 0);
        const expenses = crop.expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const profit = income - expenses;
        
        return {
          id: `low-profit-${crop.id}`,
          type: 'error' as const,
          title: 'Low Profit Alert',
          message: `${crop.name} is showing a loss of ₹${Math.abs(profit).toLocaleString()}. Consider reviewing expenses.`,
          timestamp: new Date(),
          read: false,
        };
      });
    
    return lowProfitNotifications;
  };

  // Check for high expenses
  const checkHighExpenses = () => {
    const highExpenseThreshold = 10000; // ₹10,000 threshold
    
    const highExpenseNotifications = crops
      .filter(crop => {
        const expenses = crop.expenses.reduce((sum, exp) => sum + exp.amount, 0);
        return expenses > highExpenseThreshold;
      })
      .map(crop => {
        const expenses = crop.expenses.reduce((sum, exp) => sum + exp.amount, 0);
        
        return {
          id: `high-expense-${crop.id}`,
          type: 'warning' as const,
          title: 'High Expenses Detected',
          message: `${crop.name} has expenses of ₹${expenses.toLocaleString()}. Review your spending.`,
          timestamp: new Date(),
          read: false,
        };
      });
    
    return highExpenseNotifications;
  };

  // Check for successful crops
  const checkSuccessfulCrops = () => {
    const successThreshold = 10000; // ₹10,000 profit threshold
    
    const successNotifications = crops
      .filter(crop => {
        const income = crop.income.reduce((sum, inc) => sum + inc.amount, 0);
        const expenses = crop.expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const profit = income - expenses;
        return profit > successThreshold;
      })
      .map(crop => {
        const income = crop.income.reduce((sum, inc) => sum + inc.amount, 0);
        const expenses = crop.expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const profit = income - expenses;
        
        return {
          id: `success-${crop.id}`,
          type: 'success' as const,
          title: 'Excellent Performance!',
          message: `${crop.name} is showing a profit of ₹${profit.toLocaleString()}. Great work!`,
          timestamp: new Date(),
          read: false,
        };
      });
    
    return successNotifications;
  };

  // Check for recent activities
  const checkRecentActivities = () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentActivities = [];
    
    // Check for recent expenses
    crops.forEach(crop => {
      const recentExpenses = crop.expenses.filter(exp => new Date(exp.date) >= oneWeekAgo);
      if (recentExpenses.length > 0) {
        recentActivities.push({
          id: `recent-expense-${crop.id}`,
          type: 'info' as const,
          title: 'Recent Activity',
          message: `${recentExpenses.length} new expense(s) added to ${crop.name}.`,
          timestamp: new Date(),
          read: false,
        });
      }
    });
    
    // Check for recent income
    crops.forEach(crop => {
      const recentIncome = crop.income.filter(inc => new Date(inc.date) >= oneWeekAgo);
      if (recentIncome.length > 0) {
        recentActivities.push({
          id: `recent-income-${crop.id}`,
          type: 'success' as const,
          title: 'Income Recorded',
          message: `${recentIncome.length} new income entry(ies) added to ${crop.name}.`,
          timestamp: new Date(),
          read: false,
        });
      }
    });
    
    return recentActivities;
  };

  // Generate all notifications
  const generateNotifications = () => {
    const allNotifications = [
      ...checkHarvestSeason(),
      ...checkLowProfitCrops(),
      ...checkHighExpenses(),
      ...checkSuccessfulCrops(),
      ...checkRecentActivities(),
    ];
    
    setNotifications(allNotifications);
    
    // Show toast notifications for new alerts
    allNotifications.forEach(notification => {
      if (!notification.read) {
        switch (notification.type) {
          case 'success':
            toast.success(notification.title, {
              description: notification.message,
            });
            break;
          case 'warning':
            toast.warning(notification.title, {
              description: notification.message,
            });
            break;
          case 'error':
            toast.error(notification.title, {
              description: notification.message,
            });
            break;
          case 'info':
            toast.info(notification.title, {
              description: notification.message,
            });
            break;
        }
      }
    });
  };

  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Check for notifications periodically
  useEffect(() => {
    if (crops.length > 0) {
      generateNotifications();
    }
  }, [crops, landExpenses]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    clearAllNotifications,
    generateNotifications,
  };
}; 