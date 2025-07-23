import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Send, Trash2, MessageSquare, History } from 'lucide-react-native';
import { useChatContext } from '@/contexts/ChatContext';
import { ChatHistory } from '@/components/ChatHistory';
import { useRouter } from 'expo-router';
import Markdown from 'react-native-markdown-package';

type TabName = 'chat' | 'history';

export default function ChatScreen() {
  const { 
    messages, 
    isLoading, 
    sendMessage, 
    clearMessages, 
    chatHistory, 
    startNewChat, 
    loadChat, 
    deleteChat,
    currentChatId
  } = useChatContext();
  const [inputText, setInputText] = React.useState('');
  const [activeTab, setActiveTab] = useState<TabName>('chat');
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  const handleSend = () => {
    if (inputText.trim() === '') return;
    sendMessage(inputText);
    setInputText('');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSelectChat = (chatId: string) => {
    loadChat(chatId);
    setActiveTab('chat');
  };

  const handleNewChat = () => {
    startNewChat();
    setActiveTab('chat');
  };

  const handleOpenFullChat = () => {
    router.push('/chatbot');
  };

  // Custom markdown styles
  const markdownStyles = {
    heading1: {
      color: '#FFF',
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      marginTop: 16,
      marginBottom: 8,
    },
    heading2: {
      color: '#FFF',
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      marginTop: 12,
      marginBottom: 6,
    },
    heading3: {
      color: '#FFF',
      fontSize: 18,
      fontFamily: 'Inter-Bold',
      marginTop: 10,
      marginBottom: 5,
    },
    text: {
      color: '#FFF',
      fontSize: 16,
      fontFamily: 'Inter-Regular',
    },
    strong: {
      color: '#FFF',
      fontWeight: 'bold',
    },
    em: {
      color: '#FFF',
      fontStyle: 'italic',
    },
    blockquote: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderLeftWidth: 4,
      borderLeftColor: '#F57C00',
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginVertical: 4,
    },
    code: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: '#FFF',
      fontFamily: 'monospace',
      padding: 8,
      borderRadius: 4,
    },
    bullet_list: {
      color: '#FFF',
    },
    list_item: {
      color: '#FFF',
      marginBottom: 4,
    },
    hr: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      height: 1,
      marginVertical: 8,
    },
  };

  const renderChatHistory = () => {
    return (
      <View style={styles.historyContainer}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyHeaderTitle}>Lịch sử trò chuyện</Text>
          <TouchableOpacity 
            style={styles.newChatButton}
            onPress={handleNewChat}
          >
            <MessageSquare size={16} color="white" />
            <Text style={styles.newChatButtonText}>Trò chuyện mới</Text>
          </TouchableOpacity>
        </View>
        <ChatHistory 
          history={chatHistory} 
          onSelectChat={handleSelectChat}
          onDeleteChat={deleteChat}
          currentChatId={currentChatId}
        />
      </View>
    );
  };

  const renderChatInterface = () => {
    return (
      <>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <View style={[
              styles.messageBubble,
              item.isUser ? styles.userMessage : styles.botMessage
            ]}>
              {item.isUser ? (
                <Text style={[
                  styles.messageText,
                  item.isUser && styles.userMessageText
                ]}>
                  {item.text}
                </Text>
              ) : (
                <ScrollView>
                  <Markdown 
                    styles={markdownStyles}
                    enableLightBox={false}
                  >
                    {item.text}
                  </Markdown>
                </ScrollView>
              )}
              <Text style={[
                styles.messageTime,
                item.isUser && styles.userMessageTime
              ]}>
                {formatTime(item.timestamp)}
              </Text>
            </View>
          )}
        />
        
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#F57C00" />
            <Text style={styles.loadingText}>Đang suy nghĩ...</Text>
          </View>
        )}
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={100}
        >
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Hỏi điều gì đó..."
              placeholderTextColor="#999"
              multiline
              maxLength={500}
            />
            <Pressable 
              style={({ pressed }) => [
                styles.sendButton,
                pressed && styles.sendButtonPressed,
                isLoading && styles.sendButtonDisabled
              ]}
              onPress={handleSend}
              disabled={isLoading}
            >
              <Send size={20} color="white" />
            </Pressable>
          </View>
        </KeyboardAvoidingView>

        <TouchableOpacity 
          style={styles.expandButton}
          onPress={handleOpenFullChat}
        >
          <Text style={styles.expandButtonText}>Mở rộng</Text>
        </TouchableOpacity>
      </>
    );
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trợ lý AI</Text>
        {activeTab === 'chat' && (
          <Pressable 
            style={({ pressed }) => [
              styles.clearButton,
              pressed && styles.clearButtonPressed
            ]}
            onPress={clearMessages}
          >
            <Trash2 size={18} color="#fff" />
          </Pressable>
        )}
      </View>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'chat' && styles.activeTab]}
          onPress={() => setActiveTab('chat')}
        >
          <MessageSquare size={18} color={activeTab === 'chat' ? '#F57C00' : '#999'} />
          <Text style={[styles.tabText, activeTab === 'chat' && styles.activeTabText]}>
            Trò chuyện
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <History size={18} color={activeTab === 'history' ? '#F57C00' : '#999'} />
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            Lịch sử
          </Text>
        </TouchableOpacity>
      </View>
      
      {activeTab === 'chat' ? renderChatInterface() : renderChatHistory()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1D1E33',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  clearButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1D1E33',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2B3D',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#F57C00',
  },
  tabText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#999',
  },
  activeTabText: {
    color: '#F57C00',
  },
  messageList: {
    flex: 1,
    backgroundColor: '#121212',
  },
  messageListContent: {
    padding: 16,
    paddingBottom: 70,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
    marginBottom: 12,
  },
  userMessage: {
    backgroundColor: '#F57C00',
    alignSelf: 'flex-end',
  },
  botMessage: {
    backgroundColor: '#2A2B3D',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#FFF',
  },
  userMessageText: {
    color: '#FFF',
  },
  messageTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#1D1E33',
    borderRadius: 18,
    alignSelf: 'flex-start',
    marginLeft: 16,
    marginBottom: 16,
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    marginLeft: 8,
    color: '#FFF',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#1D1E33',
    borderTopWidth: 1,
    borderTopColor: '#2A2B3D',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#2A2B3D',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#FFF',
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F57C00',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonPressed: {
    backgroundColor: '#D66A00',
  },
  sendButtonDisabled: {
    backgroundColor: '#666',
  },
  historyContainer: {
    flex: 1,
    backgroundColor: '#121212',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  historyHeaderTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#FFF',
  },
  newChatButton: {
    flexDirection: 'row',
    backgroundColor: '#F57C00',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: 'center',
    gap: 6,
  },
  newChatButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#FFF',
  },
  expandButton: {
    position: 'absolute',
    bottom: 70,
    right: 16,
    backgroundColor: '#1D1E33',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F57C00',
  },
  expandButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#F57C00',
  },
}); 