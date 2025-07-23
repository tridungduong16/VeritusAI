import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Send, ArrowLeft, Clock, AlertCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useChatContext } from '@/contexts/ChatContext';
import type { Message } from '@/contexts/ChatContext';

const ChatbotScreen: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  const { messages, isLoading, sendMessage } = useChatContext();

  const handleSendMessage = () => {
    if (inputText.trim()) {
      sendMessage(inputText.trim());
      setInputText('');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isError = !item.isUser && item.metadata?.error;
    
    return (
      <View style={[
        styles.messageContainer, 
        item.isUser ? styles.userMessage : styles.botMessage,
        isError && styles.errorMessage
      ]}>
        <Text style={[
          styles.messageText,
          item.isUser && styles.userMessageText,
          isError && styles.errorMessageText
        ]}>
          {item.text}
        </Text>
        
        <View style={styles.messageFooter}>
          {!item.isUser && item.metadata?.timeTaken && (
            <View style={styles.timeTakenContainer}>
              <Clock size={12} color="rgba(255, 255, 255, 0.7)" />
              <Text style={styles.timeTakenText}>
                {item.metadata.timeTaken.toFixed(2)}s
              </Text>
            </View>
          )}
          
          {isError && (
            <View style={styles.errorIndicator}>
              <AlertCircle size={12} color="#FF6B6B" />
            </View>
          )}
          
          <Text style={[
            styles.messageTime,
            item.isUser && styles.userMessageTime
          ]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen 
        options={{ 
          headerShown: false,
        }} 
      />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trò chuyện</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={isLoading ? (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingBubble}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.loadingText}>Đang xử lý...</Text>
            </View>
          </View>
        ) : null}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
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
            editable={!isLoading}
          />
          <TouchableOpacity
            style={({ pressed }) => [
              styles.sendButton,
              pressed && styles.sendButtonPressed,
              isLoading && styles.sendButtonDisabled
            ]}
            onPress={handleSendMessage}
            disabled={isLoading || inputText.trim() === ''}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Send size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  messageContainer: {
    padding: 12,
    borderRadius: 18,
    marginBottom: 12,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#F57C00',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#2A2B3D',
  },
  errorMessage: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  messageText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#FFF',
  },
  userMessageText: {
    color: 'white',
  },
  errorMessageText: {
    color: '#FFD1D1',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  timeTakenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  timeTakenText: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 2,
  },
  errorIndicator: {
    marginRight: 6,
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
  loadingContainer: {
    padding: 8,
    alignItems: 'flex-start',
  },
  loadingBubble: {
    backgroundColor: '#2A2B3D',
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#FFF',
    marginLeft: 8,
  },
});

export default ChatbotScreen;
