// Voice Recognition Utilities for Farm Finance Tracker

export interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
}

export interface VoiceCommand {
  action: 'add_expense' | 'add_income' | 'show_summary' | 'unknown';
  amount?: number;
  category?: string;
  description?: string;
  crop?: string;
  confidence: number;
  rawText: string;
}

export class VoiceRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isSupported: boolean = false;
  private isListening: boolean = false;

  constructor() {
    this.initializeRecognition();
  }

  private initializeRecognition() {
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    this.isSupported = true;
    this.recognition = new SpeechRecognition();
    
    // Configure recognition settings
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-IN'; // Indian English for better currency recognition
    this.recognition.maxAlternatives = 1;
  }

  public isAvailable(): boolean {
    return this.isSupported && this.recognition !== null;
  }

  public async startListening(): Promise<VoiceRecognitionResult> {
    if (!this.recognition || this.isListening) {
      throw new Error('Voice recognition not available or already listening');
    }

    return new Promise((resolve, reject) => {
      if (!this.recognition) return reject(new Error('Recognition not initialized'));

      this.isListening = true;

      this.recognition.onresult = (event) => {
        const result = event.results[0];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence;

        resolve({
          transcript: transcript.trim(),
          confidence: confidence
        });
      };

      this.recognition.onerror = (event) => {
        this.isListening = false;
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      try {
        this.recognition.start();
      } catch (error) {
        this.isListening = false;
        reject(error);
      }
    });
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  public getListeningStatus(): boolean {
    return this.isListening;
  }
}

// AI-powered voice command parser
export async function parseVoiceCommand(transcript: string): Promise<VoiceCommand> {
  const lowerText = transcript.toLowerCase();
  const result: VoiceCommand = {
    action: 'unknown',
    confidence: 0,
    rawText: transcript
  };

  // Detect action type
  if (lowerText.includes('add expense') || lowerText.includes('expense of') || lowerText.includes('spent')) {
    result.action = 'add_expense';
    result.confidence += 0.3;
  } else if (lowerText.includes('add income') || lowerText.includes('earned') || lowerText.includes('income of')) {
    result.action = 'add_income';
    result.confidence += 0.3;
  } else if (lowerText.includes('show') || lowerText.includes('summary') || lowerText.includes('total')) {
    result.action = 'show_summary';
    result.confidence += 0.3;
  }

  // Extract amount (supports ₹, rupees, rs)
  const amountPatterns = [
    /₹\s*(\d+(?:,\d+)*(?:\.\d+)?)/g,
    /(?:rupees?|rs\.?)\s*(\d+(?:,\d+)*(?:\.\d+)?)/gi,
    /(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:rupees?|rs\.?)/gi,
    /(?:of|for)\s*(\d+(?:,\d+)*(?:\.\d+)?)/gi
  ];

  for (const pattern of amountPatterns) {
    const match = pattern.exec(lowerText);
    if (match) {
      const amountStr = match[1].replace(/,/g, '');
      result.amount = parseFloat(amountStr);
      result.confidence += 0.3;
      break;
    }
  }

  // Extract category using common farm expense categories
  const categories = [
    'seeds', 'fertilizer', 'pesticide', 'labor', 'irrigation', 'fuel',
    'equipment', 'maintenance', 'transport', 'storage', 'marketing',
    'patti katte', 'tractor guntuku', 'dunnakam', 'plough', 'acchulu', 'guntuka'
  ];

  for (const category of categories) {
    if (lowerText.includes(category)) {
      result.category = category.charAt(0).toUpperCase() + category.slice(1);
      result.confidence += 0.2;
      break;
    }
  }

  // Extract crop name (common crops)
  const crops = [
    'rice', 'wheat', 'corn', 'cotton', 'sugarcane', 'tomato', 'potato',
    'onion', 'chili', 'turmeric', 'groundnut', 'soybean', 'maize'
  ];

  for (const crop of crops) {
    if (lowerText.includes(crop)) {
      result.crop = crop.charAt(0).toUpperCase() + crop.slice(1);
      result.confidence += 0.2;
      break;
    }
  }

  // Set description as the original text if no specific parts were extracted
  if (!result.category && !result.crop) {
    result.description = transcript;
  } else {
    // Create a description from extracted parts
    const parts = [];
    if (result.category) parts.push(result.category);
    if (result.crop) parts.push(`for ${result.crop}`);
    result.description = parts.join(' ') || transcript;
  }

  return result;
}

// Enhanced parser using Gemini AI for better accuracy
export async function parseVoiceCommandWithAI(transcript: string): Promise<VoiceCommand> {
  try {
    const { askGemini } = await import('./gemini');
    
    const prompt = `
Parse this voice command for a farm expense tracker app. Extract:
- action: "add_expense", "add_income", or "show_summary"
- amount: numeric value in rupees
- category: expense category (Seeds, Fertilizer, Labor, etc.)
- crop: crop name if mentioned
- description: brief description

Voice command: "${transcript}"

Respond in JSON format:
{
  "action": "add_expense",
  "amount": 500,
  "category": "Seeds",
  "crop": "Rice",
  "description": "Seeds for Rice",
  "confidence": 0.9
}`;

    const response = await askGemini(prompt, '');
    
    try {
      const parsed = JSON.parse(response);
      return {
        ...parsed,
        rawText: transcript
      };
    } catch {
      // Fallback to basic parser if JSON parsing fails
      return parseVoiceCommand(transcript);
    }
  } catch {
    // Fallback to basic parser if Gemini fails
    return parseVoiceCommand(transcript);
  }
}

// Text-to-Speech for feedback
export class TextToSpeechService {
  private synth: SpeechSynthesis;
  private isSupported: boolean = false;

  constructor() {
    if ('speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.isSupported = true;
    }
  }

  public isAvailable(): boolean {
    return this.isSupported;
  }

  public speak(text: string, options: { rate?: number; pitch?: number; volume?: number } = {}) {
    if (!this.isSupported) return;

    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;
    utterance.lang = 'en-IN';

    this.synth.speak(utterance);
  }

  public stop() {
    if (this.isSupported) {
      this.synth.cancel();
    }
  }
}

// Global instances
export const voiceRecognition = new VoiceRecognitionService();
export const textToSpeech = new TextToSpeechService();
