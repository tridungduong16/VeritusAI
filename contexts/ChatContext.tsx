import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

export type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
};

type ChatContextType = {
  messages: Message[];
  isLoading: boolean;
  chatHistory: ChatSession[];
  currentChatId: string | null;
  sendMessage: (text: string) => void;
  clearMessages: () => void;
  startNewChat: () => void;
  loadChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

type ChatProviderProps = {
  children: ReactNode;
};

const STORAGE_KEY = 'chat_history';

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  // Sample responses for demonstration
  const sampleResponses = [
    "Cảm ơn câu hỏi của bạn. Tôi đang tìm kiếm thông tin phù hợp.",
    "Đây là một câu hỏi thú vị. Dựa trên thông tin tôi có, tôi có thể giúp bạn như sau.",
    "Tôi hiểu câu hỏi của bạn. Hãy để tôi giải thích chi tiết hơn về vấn đề này.",
    "Đó là một chủ đề phức tạp. Tôi sẽ cố gắng giải thích một cách đơn giản nhất.",
    "Cảm ơn bạn đã hỏi. Đây là thông tin bạn cần biết về vấn đề này."
  ];

  // Load chat history from storage on initial load
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const storedHistory = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedHistory) {
          const parsedHistory = JSON.parse(storedHistory);
          // Convert string dates back to Date objects
          const formattedHistory = parsedHistory.map((chat: any) => ({
            ...chat,
            createdAt: new Date(chat.createdAt),
            updatedAt: new Date(chat.updatedAt),
            messages: chat.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          }));
          setChatHistory(formattedHistory);
          
          // Start a new chat by default
          startNewChat();
        } else {
          // If no history, start a new chat
          startNewChat();
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
        startNewChat();
      }
    };
    
    loadChatHistory();
  }, []);

  // Save chat history to storage whenever it changes
  useEffect(() => {
    const saveChatHistory = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(chatHistory));
      } catch (error) {
        console.error('Failed to save chat history:', error);
      }
    };
    
    if (chatHistory.length > 0) {
      saveChatHistory();
    }
  }, [chatHistory]);

  // Update current chat in history whenever messages change
  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      setChatHistory(prevHistory => {
        return prevHistory.map(chat => {
          if (chat.id === currentChatId) {
            return {
              ...chat,
              messages: [...messages],
              updatedAt: new Date(),
              // Update title based on first user message if not already set
              title: chat.title === 'Cuộc trò chuyện mới' && messages.some(m => m.isUser) 
                ? messages.find(m => m.isUser)?.text.substring(0, 30) + '...'
                : chat.title
            };
          }
          return chat;
        });
      });
    }
  }, [messages, currentChatId]);

  const getRandomResponse = (question: string) => {
    const randomIndex = Math.floor(Math.random() * sampleResponses.length);
    const baseResponse = sampleResponses[randomIndex];
    return `${baseResponse} Câu hỏi của bạn là về "${question}". Đây là phản hồi mẫu để minh họa chức năng chatbot.`;
  };

  const sendMessage = (text: string) => {
    if (text.trim() === '') return;
    
    // Ensure we have an active chat
    if (!currentChatId) {
      startNewChat();
    }
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      isUser: true,
      timestamp: new Date(),
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getRandomResponse(text),
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prevMessages => [...prevMessages, botResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const clearMessages = () => {
    // Create a new chat with just the welcome message
    startNewChat();
  };

  const startNewChat = () => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      text: 'Xin chào! Tôi có thể giúp gì cho bạn hôm nay?',
      isUser: false,
      timestamp: new Date(),
    };
    
    const newChatId = Date.now().toString();
    const newChat: ChatSession = {
      id: newChatId,
      title: 'Cuộc trò chuyện mới',
      messages: [welcomeMessage],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setChatHistory(prev => [newChat, ...prev]);
    setCurrentChatId(newChatId);
    setMessages([welcomeMessage]);
  };

  const loadChat = (chatId: string) => {
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
      setMessages(chat.messages);
      setCurrentChatId(chatId);
    }
  };

  const deleteChat = (chatId: string) => {
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
    
    // If we're deleting the current chat, start a new one
    if (chatId === currentChatId) {
      startNewChat();
    }
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        isLoading,
        chatHistory,
        currentChatId,
        sendMessage,
        clearMessages,
        startNewChat,
        loadChat,
        deleteChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}; 