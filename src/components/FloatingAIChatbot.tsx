import { useState } from 'react';
import { useCropStore } from '@/store/supabaseCropStore';

const FAQ = [
  { q: 'How do I add a new crop?', a: 'Go to the dashboard and click the "Add Crop" button.' },
  { q: 'How do I record an expense?', a: 'Open a crop, go to Expenses, and click "Add Expense".' },
  { q: 'How do I use bill image OCR?', a: 'When adding an expense, use the "Extract from Bill Image" button to auto-fill details.' },
  { q: 'How do I see my profit?', a: 'Profit is shown on the dashboard and in each crop\'s details.' },
  { q: 'How do I install the app?', a: 'Click the install button in the top right of the dashboard.' },
  // Add more Q&A as needed
];

function getDynamicAnswer(input: string, crops: any[], landExpenses: any[]) {
  const lower = input.toLowerCase();
  if (lower.includes('total profit') || lower.includes('overall profit')) {
    const totalCropProfit = crops.reduce((sum, crop) => {
      const income = crop.income.reduce((total, inc) => total + inc.amount, 0);
      const expenses = crop.expenses.reduce((total, exp) => total + exp.amount, 0);
      return sum + (income - expenses);
    }, 0);
    const totalLandExpenses = landExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const netProfit = totalCropProfit - totalLandExpenses;
    return `Your total profit is ₹${netProfit.toLocaleString()}.`;
  }
  if (lower.includes('how many crops')) {
    return `You have ${crops.length} crops.`;
  }
  if (lower.includes('last expense')) {
    const allExpenses = crops.flatMap(crop => crop.expenses);
    const allLand = landExpenses || [];
    const all = [...allExpenses, ...allLand].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (all.length === 0) return 'No expenses found.';
    const e = all[0];
    return `Your last expense was ₹${e.amount} for ${e.category} on ${e.date}.`;
  }
  if (lower.includes('last income')) {
    const allIncome = crops.flatMap(crop => crop.income).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (allIncome.length === 0) return 'No income found.';
    const i = allIncome[0];
    return `Your last income was ₹${i.amount} from ${i.source} on ${i.date}.`;
  }
  if (lower.includes('highest expense')) {
    const allExpenses = crops.flatMap(crop => crop.expenses);
    const allLand = landExpenses || [];
    const all = [...allExpenses, ...allLand];
    if (all.length === 0) return 'No expenses found.';
    const max = all.reduce((a, b) => (a.amount > b.amount ? a : b));
    return `Your highest expense is ₹${max.amount} for ${max.category} on ${max.date}.`;
  }
  if (lower.includes('total income')) {
    const totalIncome = crops.reduce((sum, crop) => sum + crop.income.reduce((t, i) => t + i.amount, 0), 0);
    return `Your total income is ₹${totalIncome.toLocaleString()}.`;
  }
  if (lower.includes('total expenses')) {
    const totalExpenses = crops.reduce((sum, crop) => sum + crop.expenses.reduce((t, e) => t + e.amount, 0), 0);
    const totalLandExpenses = landExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    return `Your total expenses are ₹${(totalExpenses + totalLandExpenses).toLocaleString()}.`;
  }
  return null;
}

export default function FloatingAIChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<{from: 'user'|'bot', text: string}[]>([]);
  const { crops, landExpenses } = useCropStore();

  const handleSend = () => {
    if (!input.trim()) return;
    setHistory(h => [...h, { from: 'user', text: input }]);
    // Try dynamic answer first
    const dynamic = getDynamicAnswer(input, crops, landExpenses);
    if (dynamic) {
      setTimeout(() => {
        setHistory(h => [...h, { from: 'bot', text: dynamic }]);
      }, 500);
    } else {
      // Fallback to FAQ
      const match = FAQ.find(f => input.toLowerCase().includes(f.q.toLowerCase()));
      setTimeout(() => {
        setHistory(h => [...h, { from: 'bot', text: match ? match.a : 'Sorry, I don\'t know that yet. Try asking something else!' }]);
      }, 500);
    }
    setInput('');
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
              onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
              placeholder="Type your question..."
            />
            <button
              className="bg-green-600 hover:bg-green-700 text-white rounded px-3 py-1 text-sm font-semibold"
              onClick={handleSend}
            >Send</button>
          </div>
        </div>
      )}
    </>
  );
} 