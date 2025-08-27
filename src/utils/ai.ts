import { createWorker } from 'tesseract.js';
import { ExpenseCategory } from '@/types/crop';
import { askGemini } from './gemini';
import { useCropStore } from '@/store/supabaseCropStore';

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

// Build a concise context from user data for LLM
function buildUserDataContext(crops: any[], landExpenses: any[]): string {
  const totalCrops = crops.length;
  const totalCropIncome = crops.reduce((sum, c) => sum + c.income.reduce((s: number, i: any) => s + i.amount, 0), 0);
  const totalCropExpenses = crops.reduce((sum, c) => sum + c.expenses.reduce((s: number, e: any) => s + e.amount, 0), 0);
  const totalLandExpenses = landExpenses.reduce((s, e) => s + e.amount, 0);
  const net = totalCropIncome - (totalCropExpenses + totalLandExpenses);

  const recentExpense = [...crops.flatMap(c => c.expenses), ...landExpenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  return [
    `You are an assistant for a farm finance tracker. Be concise and practical.`,
    `User data summary:`,
    `- Crops: ${totalCrops}`,
    `- Total crop income: ₹${totalCropIncome.toLocaleString()}`,
    `- Total crop expenses: ₹${totalCropExpenses.toLocaleString()}`,
    `- Land expenses: ₹${totalLandExpenses.toLocaleString()}`,
    `- Net: ₹${net.toLocaleString()}`,
    recentExpense ? `- Most recent expense: ${recentExpense.category || 'N/A'} ₹${recentExpense.amount} on ${recentExpense.date}` : ''
  ].filter(Boolean).join('\n');
}

// Async Gemini-backed answer; falls back to local
export async function getAIAnswer(userMessage: string, crops: any[], landExpenses: any[]): Promise<string> {
  try {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      return getAIResponse(userMessage);
    }
    const system = buildUserDataContext(crops, landExpenses);
    const answer = await askGemini(userMessage, system);
    return answer || getAIResponse(userMessage);
  } catch (e) {
    return getAIResponse(userMessage);
  }
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

// Gemini-powered recommendations with fallback to local rules
export async function generateRecommendations(crops: any[], expenses: any[]): Promise<string[]> {
  try {
    // Fallback if API key not present
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      return generateSmartRecommendations(crops, expenses);
    }

    const totalCrops = crops.length;
    const totalIncome = crops.reduce((sum, c) => sum + c.income.reduce((s: number, i: any) => s + i.amount, 0), 0);
    const totalExpenses = crops.reduce((sum, c) => sum + c.expenses.reduce((s: number, e: any) => s + e.amount, 0), 0) +
      expenses.filter((e: any) => !e.cropId && !e.crop_id).reduce((s: number, e: any) => s + e.amount, 0);

    const cropSummaries = crops.map((c: any) => ({
      name: c.name,
      type: c.type,
      area: c.landArea,
      unit: c.landUnit,
      income: c.income.reduce((s: number, i: any) => s + i.amount, 0),
      expenses: c.expenses.reduce((s: number, e: any) => s + e.amount, 0),
    }));

    const system = [
      'You are an assistant generating 3-6 concise, actionable tips for a farm finance dashboard bell.',
      'Tips should be short (<= 140 chars), practical, and based on the data provided.',
      'Focus on profit, expense control, payment status, seasonal actions, and data hygiene.',
    ].join('\n');

    const prompt = `Data summary:\n` +
      `- Crops: ${totalCrops}\n` +
      `- Total income: ₹${totalIncome}\n` +
      `- Total expenses: ₹${totalExpenses}\n` +
      `- Per-crop summary: ${JSON.stringify(cropSummaries)}\n\n` +
      `Return ONLY a JSON array of strings with tips. Example: ["Tip 1", "Tip 2"]`;

    const raw = await askGemini(prompt, system);
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.every((x) => typeof x === 'string')) {
        return parsed.slice(0, 6);
      }
    } catch (_) {
      // Fallback: try line-based parsing
      const lines = raw.split(/\r?\n/).map((l) => l.replace(/^[-•\d\.\s]+/, '').trim()).filter(Boolean);
      if (lines.length > 0) return lines.slice(0, 6);
    }
    return generateSmartRecommendations(crops, expenses);
  } catch {
    return generateSmartRecommendations(crops, expenses);
  }
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