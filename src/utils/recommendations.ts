import { Crop, Expense } from '@/types/crop';

export function generateSmartRecommendations(crops: Crop[], expenses: Expense[]): string[] {
  const tips: string[] = [];

  // Rule: High fertilizer expenses
  const fertilizerExpenses = expenses.filter(e => e.category === 'Fertilizer');
  const totalFertilizer = fertilizerExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  if (totalExpenses > 0 && totalFertilizer / totalExpenses > 0.3) {
    tips.push('Your fertilizer expenses are more than 30% of total. Consider optimizing fertilizer usage.');
  }

  // Rule: Crops with no income
  crops.forEach(crop => {
    if (crop.income.length === 0) {
      tips.push(`No income recorded for crop "${crop.name}". Did you forget to add sales?`);
    }
  });

  // Rule: High land expenses (if you have landExpenses array, add similar logic)
  // ...

  // Rule: Expenses without description
  expenses.forEach(e => {
    if (!e.description) {
      tips.push(`Expense in category "${e.category}" is missing a description. Add details for better tracking.`);
    }
  });

  // Add more rules as needed

  return tips;
} 