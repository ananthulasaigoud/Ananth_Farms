import { useState, useEffect } from 'react';
import { useCropStore } from '@/store/supabaseCropStore';
import { getAIAnswer } from '@/utils/ai';
import { voiceRecognition, textToSpeech } from '@/utils/voiceRecognition';
import { toast } from 'sonner';

const FAQ = [
  { q: 'How do I add a new crop?', a: 'Go to the dashboard and click the "Add Crop" button.' },
  { q: 'How do I record an expense?', a: 'Open a crop, go to Expenses, and click "Add Expense".' },
  { q: 'How do I use bill image OCR?', a: 'When adding an expense, use the "Extract from Bill Image" button to auto-fill details.' },
  { q: 'How do I see my profit?', a: 'Profit is shown on the dashboard and in each crop\'s details.' },
  { q: 'How do I install the app?', a: 'Click the install button in the top right of the dashboard.' },
];

export default function FloatingAIChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<{from: 'user'|'bot', text: string}[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceSupported, setIsVoiceSupported] = useState(false);
  const { crops, landExpenses } = useCropStore();

  useEffect(() => {
    setIsVoiceSupported(voiceRecognition.isAvailable());
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    const text = input;
    setHistory(h => [...h, { from: 'user', text }]);

    // Attempt Gemini with full user context; fallback handled in getAIAnswer
    const answer = await getAIAnswer(text, crops, landExpenses);
    setHistory(h => [...h, { from: 'bot', text: answer }]);
    setInput('');
  };

  const startVoiceRecognition = async () => {
    if (!voiceRecognition.isAvailable()) {
      toast.error('Voice recognition not supported in this browser');
      return;
    }

    try {
      setIsListening(true);
      
      if (textToSpeech.isAvailable()) {
        textToSpeech.speak('Listening for your question');
      }

      const result = await voiceRecognition.startListening();
      setInput(result.transcript);
      
      if (textToSpeech.isAvailable()) {
        textToSpeech.speak('Got it! Processing your question');
      }
      
      toast.success('Voice input captured successfully!');
    } catch (error) {
      console.error('Voice recognition error:', error);
      toast.error('Voice recognition failed. Please try again.');
    } finally {
      setIsListening(false);
    }
  };

  const stopVoiceRecognition = () => {
    voiceRecognition.stopListening();
    setIsListening(false);
  };

  return (
    <>
      <button
        className="fixed bottom-6 right-6 z-50 bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-lg focus:outline-none"
        onClick={() => setOpen(o => !o)}
        aria-label="Open AI Chatbot"
      >
        💬
      </button>
      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-80 max-w-full bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 font-bold text-green-700 dark:text-green-300">AI Chatbot</div>
          <div className="flex-1 p-3 overflow-y-auto space-y-2" style={{ maxHeight: 300 }}>
            {history.length === 0 && <div className="text-gray-400 text-sm">Ask me anything about your farm data or using the app!</div>}
            {history.map((msg, i) => (
              <div key={i} className={msg.from === 'user' ? 'text-right' : 'text-left'}>
                <span className={msg.from === 'user' ? 'inline-block bg-green-100 dark:bg-green-800 text-green-900 dark:text-green-100 rounded-lg px-3 py-1 my-1' : 'inline-block bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-1 my-1'}>
                  {msg.text}
                </span>
              </div>
            ))}
          </div>
          <div className="p-2 border-t border-gray-200 dark:border-gray-700 flex gap-2">
            <input
              className="flex-1 rounded border border-gray-300 dark:border-gray-700 px-2 py-1 text-sm focus:outline-none"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !isListening) handleSend(); }}
              placeholder={isListening ? "Listening..." : "Type your question..."}
              disabled={isListening}
            />
            {isVoiceSupported && (
              <button
                className={`px-2 py-1 rounded text-sm font-semibold ${
                  isListening 
                    ? "bg-red-600 hover:bg-red-700 text-white animate-pulse" 
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
                onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
                title={isListening ? "Stop listening" : "Start voice input"}
              >
                {isListening ? '🎤' : '🎙️'}
              </button>
            )}
            <button
              className="bg-green-600 hover:bg-green-700 text-white rounded px-3 py-1 text-sm font-semibold disabled:opacity-50"
              onClick={handleSend}
              disabled={isListening}
            >Send</button>
          </div>
        </div>
      )}
    </>
  );
} 