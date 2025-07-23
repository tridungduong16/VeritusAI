import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { nanoid } from 'nanoid/non-secure';
import { sendChatMessage, ApiError } from '@/utils/api';

export type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  metadata?: {
    timeTaken?: number;
    error?: {
      message: string;
      status?: number;
    };
  };
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
            // Find first user message if it exists
            const firstUserMessage = messages.find(m => m.isUser);
            const userMessageText = firstUserMessage?.text || '';
            
            return {
              ...chat,
              messages: [...messages],
              updatedAt: new Date(),
              // Update title based on first user message if not already set
              title: chat.title === 'Cuộc trò chuyện mới' && messages.some(m => m.isUser) 
                ? userMessageText.substring(0, 30) + (userMessageText.length > 30 ? '...' : '')
                : chat.title
            };
          }
          return chat;
        });
      });
    }
  }, [messages, currentChatId]);

  const sendMessage = async (text: string) => {
    if (text.trim() === '') return;
    
    // Ensure we have an active chat
    if (!currentChatId) {
      startNewChat();
    }
    
    // Add user message
    const userMessage: Message = {
      id: nanoid(),
      text: text,
      isUser: true,
      timestamp: new Date(),
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsLoading(true);
    
    try {
      // Call the real API
      const startTime = Date.now();
      const response = await sendChatMessage(text);
      const endTime = Date.now();
      const requestTime = (endTime - startTime) / 1000; // Convert to seconds
      
      // Create bot response from API response
      const botResponse: Message = {
        id: nanoid(),
        text: response.message,
        isUser: false,
        timestamp: new Date(),
        metadata: {
          timeTaken: response.time_taken || requestTime,
        },
      };
      
      setMessages(prevMessages => [...prevMessages, botResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message with more details
      const errorMessage: Message = {
        id: nanoid(),
        text: error instanceof ApiError 
          ? `Xin lỗi, đã xảy ra lỗi: ${error.message}`
          : 'Xin lỗi, đã xảy ra lỗi khi xử lý tin nhắn của bạn. Vui lòng thử lại sau.',
        isUser: false,
        timestamp: new Date(),
        metadata: {
          error: {
            message: error.message,
            status: error instanceof ApiError ? error.status : undefined,
          },
        },
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    // Create a new chat with just the welcome message
    startNewChat();
  };

  const startNewChat = () => {
    const welcomeMessage: Message = {
      id: nanoid(),
      text: 'Xin chào! Tôi có thể giúp gì cho bạn hôm nay?',
      isUser: false,
      timestamp: new Date(),
    };
    
    const newChatId = nanoid();
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