import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { Send } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useChatContext } from '@/contexts/ChatContext';
import type { Message } from '@/contexts/ChatContext';
import Markdown from 'react-native-markdown-display';

const ChatbotScreen: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const { messages, isLoading, sendMessage } = useChatContext();

  const handleSendMessage = () => {
    if (inputText.trim()) {
      sendMessage(inputText.trim());
      setInputText('');
    }
  };

  // Custom markdown styles for bot messages
  const markdownStyles = {
    body: {
      color: '#1F2937',
      fontSize: 14,
      fontFamily: 'Inter-Regular',
    },
    heading1: {
      color: '#1F2937',
      fontSize: 18,
      fontFamily: 'Inter-Bold',
      fontWeight: 'bold' as const,
    },
    heading2: {
      color: '#1F2937',
      fontSize: 16,
      fontFamily: 'Inter-Bold',
      fontWeight: 'bold' as const,
    },
    paragraph: {
      color: '#1F2937',
      fontSize: 14,
      fontFamily: 'Inter-Regular',
    },
    strong: {
      color: '#1F2937',
      fontWeight: 'bold' as const,
    },
    em: {
      color: '#1F2937',
      fontStyle: 'italic' as const,
    },
    code_inline: {
      backgroundColor: 'rgba(31, 41, 55, 0.1)',
      color: '#1F2937',
      fontFamily: 'monospace',
      fontSize: 12,
    },
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isError = !item.isUser && item.metadata?.error;
    
    return (
      <View style={[
        styles.messageWrapper,
        item.isUser ? styles.userMessageWrapper : styles.botMessageWrapper
      ]}>
        <View style={[
          styles.messageContainer, 
          item.isUser ? styles.userMessage : styles.botMessage,
          isError && styles.errorMessage
        ]}>
          {item.isUser ? (
            <Text style={styles.userMessageText}>
              {item.text}
            </Text>
          ) : (
            <Markdown style={markdownStyles}>
              {item.text}
            </Markdown>
          )}
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

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={isLoading ? (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingBubble}>
              <ActivityIndicator size="small" color="#6B7280" />
              <Text style={styles.loadingText}>Thinking...</Text>
            </View>
          </View>
        ) : null}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
        style={styles.keyboardAvoidingView}
      >
        <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your message..."
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={500}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isLoading) && styles.sendButtonDisabled
              ]}
              onPress={handleSendMessage}
              disabled={isLoading || inputText.trim() === ''}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Send size={18} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  messagesList: {
    paddingHorizontal: 8,
    paddingVertical: 20,
    flexGrow: 1,
  },
  messageWrapper: {
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  userMessageWrapper: {
    alignItems: 'flex-end',
  },
  botMessageWrapper: {
    alignItems: 'flex-start',
  },
  messageContainer: {
    padding: 12,
    borderRadius: 16,
    width: '96%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  userMessage: {
    backgroundColor: '#1F2937',
    borderBottomRightRadius: 4,
  },
  botMessage: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderBottomLeftRadius: 4,
  },
  errorMessage: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
  },
  userMessageText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  keyboardAvoidingView: {
    width: '100%',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#1F2937',
    maxHeight: 120,
    minHeight: 40,
    paddingVertical: 8,
    paddingRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  loadingContainer: {
    paddingHorizontal: 2,
    alignItems: 'flex-start',
  },
  loadingBubble: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    width: '96%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 8,
  },
});

export default ChatbotScreen;
