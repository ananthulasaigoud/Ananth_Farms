import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Bot as BotIcon, 
  User as UserIcon, 
  Sparkles,
  ChevronDown,
  Volume2,
  VolumeX,
  Copy,
  Check,
  StopCircle,
  RotateCcw
} from 'lucide-react';
import { sendToN8N, extractAIResponse, formatBotText } from '@/utils/n8n';
import { toast } from 'sonner';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function FloatingAIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI farming assistant. How can I help you today? 🌾",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [model, setModel] = useState<'default' | 'agent'>('default');
  const [lastUserPrompt, setLastUserPrompt] = useState<string>('');
  const abortRef = useRef<AbortController | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const quickQuestions = [
    "How to maximize farm profits?",
    "Best time to plant crops?",
    "How to reduce farming expenses?",
    "Crop rotation advice",
    "Weather impact on farming",
    "Soil management tips"
  ];

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Voice recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      toast.success('Listening... Speak now!');
    };

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
      toast.success('Voice captured!');
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      toast.error('Voice recognition failed. Please try again.');
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleSendMessage = async (overridePrompt?: string) => {
    const prompt = (overridePrompt ?? inputMessage).trim();
    if (!prompt || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: prompt,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setShowQuickQuestions(false);
    setLastUserPrompt(prompt);

    // Set up abort controller to support Stop
    abortRef.current = new AbortController();

    try {
      const data = await sendToN8N({
        message: prompt,
        timestamp: new Date().toISOString(),
        userId: 'user-' + Date.now(),
        context: { model }
      }, { signal: abortRef.current.signal });

      const botResponseRaw = extractAIResponse(data);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: formatBotText(botResponseRaw),
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          text: 'Generation stopped.',
          isUser: false,
          timestamp: new Date()
        }]);
      } else {
        console.error('Error getting bot response:', error);
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          text: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
          isUser: false,
          timestamp: new Date()
        }]);
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  };

  const handleRegenerate = () => {
    if (lastUserPrompt) {
      handleSendMessage(lastUserPrompt);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
    setShowQuickQuestions(false);
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        text: "Hello! I'm your AI farming assistant. How can I help you today? 🌾",
        isUser: false,
        timestamp: new Date()
      }
    ]);
    setShowQuickQuestions(true);
    toast.success('Chat cleared!');
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast.success(isMuted ? 'Sound enabled' : 'Sound muted');
  };

  // Mobile-specific positioning and sizing
  const getMobileStyles = () => {
    if (isMobile) {
      return {
        container: "fixed inset-0 z-50",
        card: "w-full h-full max-w-none max-h-none rounded-none",
        header: "p-3",
        title: "text-base",
        subtitle: "text-xs",
        quickQuestions: "p-3",
        messages: "h-[calc(100vh-320px)]",
        inputArea: "p-3",
        buttonSize: "h-12 w-12",
        iconSize: "h-5 w-5"
      };
    }
    return {
      container: "fixed bottom-6 right-6 z-50",
      card: "w-[780px] h-[680px] rounded-3xl",
      header: "p-4",
      title: "text-lg",
      subtitle: "text-sm",
      quickQuestions: "p-4",
      messages: "h-[480px]",
      inputArea: "p-4",
      buttonSize: "h-10 w-10",
      iconSize: "h-4 w-4"
    };
  };

  const styles = getMobileStyles();

  const copyMessage = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMsgId(id);
      setTimeout(() => setCopiedMsgId(null), 1200);
    } catch (e) {
      toast.error('Unable to copy');
    }
  };

  const stopGeneration = () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
  };

  // Use a small, non-blocking container for the button when closed/minimized
  const buttonContainer = isMobile ? 'fixed bottom-4 right-4 z-50' : 'fixed bottom-6 right-6 z-50';

  if (isMinimized) {
    return (
      <div className={buttonContainer}>
        <Button
          onClick={() => setIsMinimized(false)}
          size="lg"
          className={`${styles.buttonSize} rounded-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 shadow-2xl border-0`}
        >
          <MessageCircle className={`${styles.iconSize} text-white`} />
        </Button>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <div className={buttonContainer}>
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className={`${styles.buttonSize} rounded-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 shadow-2xl border-0 animate-pulse`}
        >
          <MessageCircle className={`${styles.iconSize} text-white`} />
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Card className={`${styles.card} bg-white/95 backdrop-blur-md border-0 shadow-2xl overflow-hidden flex flex-col`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
          <div className={`${styles.header}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <BotIcon className={styles.iconSize} />
                </div>
                <div>
                  <h3 className={`font-semibold ${styles.title}`}>AI Farming Assistant</h3>
                  <p className={`text-white/80 ${styles.subtitle}`}>Powered by n8n</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Model selector */}
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value as 'default' | 'agent')}
                  className="bg-white/20 text-white text-xs rounded-md px-2 py-1 outline-none hover:bg-white/25"
                >
                  <option value="default">Default</option>
                  <option value="agent">Agent</option>
                </select>
                
                {!isMobile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    className={`h-8 w-8 p-0 text-white hover:bg-white/20`}
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(true)}
                  className={`h-8 w-8 p-0 text-white hover:bg-white/20`}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className={`h-8 w-8 p-0 text-white hover:bg-white/20`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Questions */}
        {showQuickQuestions && (
          <div className={`${styles.quickQuestions} bg-gradient-to-r from-green-50 to-blue-50 border-b`}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Quick Questions</span>
            </div>
            <div className={`grid gap-2 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {quickQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickQuestion(question)}
                  className={`text-xs h-auto py-2 px-3 text-left bg-white/80 hover:bg-white border-green-200 hover:border-green-300 text-gray-700 ${
                    isMobile ? 'text-sm py-3' : ''
                  }`}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <ScrollArea className={`flex-1 p-4 ${styles.messages}`}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start gap-3 max-w-[90%]`}>
                  {!message.isUser && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <BotIcon className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={`group relative rounded-2xl px-4 py-3 ${
                      message.isUser
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                        : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-bl-md'
                    } ${isMobile ? 'text-sm' : 'text-sm'}`}
                  >
                    <p className="leading-relaxed break-words whitespace-pre-wrap">{message.text}</p>
                    <div className={`flex items-center gap-2 mt-2 ${message.isUser ? 'text-blue-100' : 'text-gray-500'}`}>
                      <span className="text-xs">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {!message.isUser && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyMessage(message.id, message.text)}
                          className={`h-7 px-2 ${message.isUser ? 'text-blue-100' : 'text-gray-600 hover:text-gray-800'}`}
                        >
                          {copiedMsgId === message.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        </Button>
                      )}
                    </div>
                  </div>
                  {message.isUser && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 text-gray-800 flex items-center justify-center">
                      <UserIcon className="h-4 w-4" />
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className={`${styles.inputArea} border-t bg-gray-50/70 sticky bottom-0`}>          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
              className={`${styles.buttonSize} p-0 rounded-full ${
                isListening 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {isListening ? <MicOff className={styles.iconSize} /> : <Mic className={styles.iconSize} />}
            </Button>
            
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message AI Assistant"
                className={`border-0 bg-white rounded-2xl shadow-sm focus:ring-2 focus:ring-green-500 focus:ring-offset-0 ${
                  isMobile ? 'px-4 py-4 text-base' : 'px-4 py-3'
                }`}
                disabled={isLoading}
              />
            </div>
            
            {!isLoading ? (
              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim()}
                size="sm"
                className={`${styles.buttonSize} p-0 rounded-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white shadow-lg`}
              >
                <Send className={styles.iconSize} />
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  onClick={stopGeneration}
                  variant="outline"
                  size="sm"
                  className="h-10 px-3 text-red-600 border-red-300 hover:bg-red-50"
                >
                  <StopCircle className="h-4 w-4 mr-1" /> Stop
                </Button>
              </div>
            )}
          </div>
          
          {/* Footer Action Buttons */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChat}
                className={`text-gray-500 hover:text-gray-700 px-3 ${
                  isMobile ? 'text-sm h-10' : 'text-xs h-8'
                }`}
              >
                Clear Chat
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleRegenerate}
                disabled={!lastUserPrompt || isLoading}
                className={`text-gray-500 hover:text-gray-700 px-3 ${
                  isMobile ? 'text-sm h-10' : 'text-xs h-8'
                }`}
              >
                <RotateCcw className="h-4 w-4 mr-1" /> Regenerate
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={`bg-green-100 text-green-700 border-green-200 ${
                isMobile ? 'text-xs px-2 py-1' : 'text-xs'
              }`}>
                <BotIcon className="h-3 w-3 mr-1" />
                AI Powered
              </Badge>
              <Badge variant="secondary" className={`bg-blue-100 text-blue-700 border-blue-200 ${
                isMobile ? 'text-xs px-2 py-1' : 'text-xs'
              }`}>
                <Sparkles className="h-3 w-3 mr-1" />
                n8n
              </Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
} 