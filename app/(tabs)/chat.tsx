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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Send, Trash2, MessageSquare, History } from 'lucide-react-native';
import { useChatContext, Message, ChatSession } from '@/contexts/ChatContext';
import { ChatHistory } from '@/components/ChatHistory';

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
    deleteChat 
  } = useChatContext();
  const [inputText, setInputText] = React.useState('');
  const [activeTab, setActiveTab] = useState<TabName>('chat');
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

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

  const renderChatHistory = () => {
    const historyItems = chatHistory.map(chat => ({
      id: chat.id,
      title: chat.title,
      date: chat.updatedAt,
      previewText: chat.messages.length > 1 
        ? chat.messages[chat.messages.length - 1].text.substring(0, 60) + '...'
        : 'Bắt đầu cuộc trò chuyện mới',
    }));

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
          history={historyItems} 
          onSelectChat={handleSelectChat} 
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
              <Text style={[
                styles.messageText,
                item.isUser && styles.userMessageText
              ]}>
                {item.text}
              </Text>
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
            <ActivityIndicator size="small" color="#0066cc" />
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
                pressed && styles.sendButtonPressed
              ]}
              onPress={handleSend}
            >
              <Send size={20} color="white" />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
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
          <MessageSquare size={18} color={activeTab === 'chat' ? '#0066cc' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'chat' && styles.activeTabText]}>
            Trò chuyện
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <History size={18} color={activeTab === 'history' ? '#0066cc' : '#666'} />
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0066cc',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  clearButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
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
    borderBottomColor: '#0066cc',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#0066cc',
    fontWeight: 'bold',
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
    marginBottom: 12,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#0066cc',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e5e5ea',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  userMessageText: {
    color: 'white',
  },
  messageTime: {
    fontSize: 11,
    color: '#777',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginLeft: 16,
    marginBottom: 8,
  },
  loadingText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e5ea',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0066cc',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonPressed: {
    backgroundColor: '#004c99',
  },
  historyContainer: {
    flex: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
    backgroundColor: '#fff',
  },
  historyHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0066cc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  newChatButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 