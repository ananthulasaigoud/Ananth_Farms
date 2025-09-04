import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, User, Sparkles, Mic, MicOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface AIChatbotProps {
  className?: string;
}

import { sendToN8N, extractAIResponse } from '@/utils/n8n';

const AIChatbot = ({ className }: AIChatbotProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI farm assistant powered by n8n. I can help you with farm management advice, expense tracking tips, and crop planning. Ask me anything about farming!",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceSupported, setIsVoiceSupported] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    "How to maximize profits?",
    "Best time to plant crops?",
    "How to reduce expenses?",
    "Crop rotation advice",
    "Weather impact on farming"
  ];

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    setIsVoiceSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }, []);

  const startVoiceRecognition = () => {
    if (!isVoiceSupported) {
      toast.error('Voice recognition not supported in this browser');
      return;
    }

    try {
      setIsListening(true);
      
      // @ts-ignore - WebkitSpeechRecognition is not in types
      const recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
        toast.success('Voice input captured!');
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast.error('Voice recognition failed. Please try again.');
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (error) {
      console.error('Voice recognition error:', error);
      toast.error('Voice recognition failed. Please try again.');
      setIsListening(false);
    }
  };

  const stopVoiceRecognition = () => {
    setIsListening(false);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Send message to n8n webhook
      const data = await sendToN8N({
        message: userMessage.text,
        timestamp: new Date().toISOString(),
        userId: 'farm-user' // You can customize this
      });
      
      console.log('Received response from n8n:', data);
      console.log('Response type:', typeof data);
      console.log('Response keys:', Object.keys(data));
      
      // Extract the response from n8n workflow
      const aiText = extractAIResponse(data);
      console.log('Extracted AI response:', aiText);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiText,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (e) {
      console.error('Error calling n8n webhook:', e);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting to my knowledge base right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5" /> AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <ScrollArea ref={scrollAreaRef} className="h-64 border rounded p-3 bg-muted/30">
            <div className="space-y-2">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${msg.isUser ? 'bg-primary text-primary-foreground' : 'bg-background border'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about your farm data..."
              disabled={isListening}
            />
            {isVoiceSupported && (
              <Button
                onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
                disabled={isLoading}
                variant={isListening ? "destructive" : "outline"}
                className={isListening ? "animate-pulse" : ""}
                title={isListening ? "Stop listening" : "Start voice input"}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
            )}
            <Button onClick={handleSendMessage} disabled={isLoading || isListening}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q, idx) => (
              <Button key={idx} variant="outline" size="sm" onClick={() => handleQuickQuestion(q)}>
                <Sparkles className="w-3 h-3 mr-1" /> {q}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIChatbot; 