import { createWorker } from 'tesseract.js';
import { ExpenseCategory } from '@/types/crop';

// Tesseract OCR for extracting text from images (100% free)
export async function extractTextFromImage(imageFile: File): Promise<string> {
  try {
    const worker = await createWorker('eng');
    const { data: { text } } = await worker.recognize(imageFile);
    await worker.terminate();
    return text.trim();
  } catch (error) {
    console.error('OCR Error:', error);
    return '';
  }
}

// Smart category suggestion based on description (using free keyword-based classification)
export async function suggestExpenseCategory(description: string): Promise<ExpenseCategory> {
  const categories: ExpenseCategory[] = [
    'Seeds', 'Sowing Labor', 'Weeding Labor', 'Harvesting Labor', 'Cotton Picking Labor',
    'Fertilizer', 'Fertilizer Application Labor', 'Pesticide', 'Pesticide Spraying Labor',
    'Irrigation', 'Equipment Rent', 'Transportation', 'Other'
  ];
  
  // Simple keyword-based classification (free alternative to AI API)
  const lowerDesc = description.toLowerCase();
  
  if (lowerDesc.includes('seed') || lowerDesc.includes('plant') || lowerDesc.includes('sapling')) {
    return 'Seeds';
  }
  if (lowerDesc.includes('sowing') || lowerDesc.includes('planting')) {
    return 'Sowing Labor';
  }
  if (lowerDesc.includes('weeding') || lowerDesc.includes('weed')) {
    return 'Weeding Labor';
  }
  if (lowerDesc.includes('harvest') || lowerDesc.includes('harvesting')) {
    return 'Harvesting Labor';
  }
  if (lowerDesc.includes('picking') || lowerDesc.includes('cotton pick')) {
    return 'Cotton Picking Labor';
  }
  if (lowerDesc.includes('fertilizer') || lowerDesc.includes('manure') || lowerDesc.includes('nutrient')) {
    return 'Fertilizer';
  }
  if (lowerDesc.includes('fertilizer application') || lowerDesc.includes('fertilizer labor')) {
    return 'Fertilizer Application Labor';
  }
  if (lowerDesc.includes('pesticide') || lowerDesc.includes('insecticide') || lowerDesc.includes('herbicide')) {
    return 'Pesticide';
  }
  if (lowerDesc.includes('pesticide spray') || lowerDesc.includes('spraying labor')) {
    return 'Pesticide Spraying Labor';
  }
  if (lowerDesc.includes('irrigation') || lowerDesc.includes('water') || lowerDesc.includes('pump')) {
    return 'Irrigation';
  }
  if (lowerDesc.includes('equipment') || lowerDesc.includes('tool') || lowerDesc.includes('machine') || lowerDesc.includes('tractor')) {
    return 'Equipment Rent';
  }
  if (lowerDesc.includes('transport') || lowerDesc.includes('fuel') || lowerDesc.includes('diesel') || lowerDesc.includes('petrol')) {
    return 'Transportation';
  }
  
  return 'Other';
}

// Extract amount from text (for future OCR integration)
export function extractAmountFromText(text: string): number | null {
  // Look for currency patterns like ₹1000, Rs. 500, 1000, etc.
  const amountPatterns = [
    /₹\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/,  // ₹1000 or ₹1,000.50
    /Rs\.?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/,  // Rs. 1000 or Rs 1000
    /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:rupees?|rs)/i,  // 1000 rupees
    /(\d+(?:,\d{3})*(?:\.\d{2})?)/  // Just numbers
  ];
  
  for (const pattern of amountPatterns) {
    const match = text.match(pattern);
    if (match) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(amount) && amount > 0 && amount < 1000000) { // Reasonable range
        return amount;
      }
    }
  }
  
  return null;
}

// AI Chatbot responses (free local responses)
export function getAIResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();
  
  // Farm management advice
  if (lowerMessage.includes('profit') || lowerMessage.includes('earn')) {
    return "To maximize profits, track all expenses carefully, consider crop rotation, and monitor market prices. Use this app to analyze which crops give you the best returns.";
  }
  
  if (lowerMessage.includes('expense') || lowerMessage.includes('cost')) {
    return "Track all expenses including seeds, labor, fertilizer, fuel, and equipment. This helps you understand your true cost per acre and identify areas to reduce costs.";
  }
  
  if (lowerMessage.includes('crop') || lowerMessage.includes('plant')) {
    return "Choose crops based on your soil type, climate, and market demand. Consider crop rotation to maintain soil health and reduce pest problems.";
  }
  
  if (lowerMessage.includes('weather') || lowerMessage.includes('rain')) {
    return "Monitor weather forecasts regularly. Plan irrigation based on rainfall predictions. Consider crop insurance for weather-related risks.";
  }
  
  if (lowerMessage.includes('soil') || lowerMessage.includes('fertilizer')) {
    return "Test your soil regularly to understand nutrient levels. Apply fertilizers based on soil test results and crop requirements. Consider organic alternatives.";
  }
  
  if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
    return "I can help you with farm management advice, expense tracking tips, and crop planning. Ask me about profits, expenses, crops, weather, or soil management.";
  }
  
  // Default response
  return "I'm your AI farm assistant! I can help with farm management advice, expense tracking, and crop planning. Ask me about profits, expenses, crops, weather, or soil management.";
}

// Smart recommendations based on user data
export function generateSmartRecommendations(crops: any[], expenses: any[]): string[] {
  const recommendations: string[] = [];
  
  // Analyze expenses
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const avgExpensePerCrop = totalExpenses / Math.max(crops.length, 1);
  
  if (avgExpensePerCrop > 50000) {
    recommendations.push("Your average expense per crop is high. Consider reviewing your input costs and looking for bulk purchase opportunities.");
  }
  
  // Check for missing data
  const cropsWithoutExpenses = crops.filter(crop => crop.expenses.length === 0);
  if (cropsWithoutExpenses.length > 0) {
    recommendations.push(`You have ${cropsWithoutExpenses.length} crops without recorded expenses. Add expenses to get accurate profit calculations.`);
  }
  
  // Seasonal advice
  const currentMonth = new Date().getMonth();
  if (currentMonth >= 2 && currentMonth <= 5) {
    recommendations.push("It's the main growing season. Monitor your crops regularly and record all expenses for accurate profit tracking.");
  }
  
  if (recommendations.length === 0) {
    recommendations.push("Great job tracking your farm data! Keep recording expenses and income for better insights.");
  }
  
  return recommendations;
}

// Predict profit based on historical data (simple algorithm)
export function predictProfit(cropType: string, landArea: number, historicalData: any[]): number {
  // Simple prediction based on average profit per acre for this crop type
  const similarCrops = historicalData.filter(crop => crop.type === cropType);
  
  if (similarCrops.length === 0) {
    // Default prediction if no historical data
    return landArea * 15000; // ₹15,000 per acre estimate
  }
  
  const avgProfitPerAcre = similarCrops.reduce((sum, crop) => {
    const income = crop.income.reduce((i: number, inc: any) => i + inc.amount, 0);
    const expenses = crop.expenses.reduce((e: number, exp: any) => e + exp.amount, 0);
    return sum + ((income - expenses) / crop.landArea);
  }, 0) / similarCrops.length;
  
  return landArea * avgProfitPerAcre;
} 