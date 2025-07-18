import React from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { Clock, MessageSquare, Trash2 } from 'lucide-react-native';
import { ChatSession } from '@/contexts/ChatContext';

type ChatHistoryProps = {
  history: ChatSession[];
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  currentChatId: string | null;
};

export const ChatHistory: React.FC<ChatHistoryProps> = ({ 
  history, 
  onSelectChat, 
  onDeleteChat,
  currentChatId
}) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lịch sử trò chuyện</Text>
      
      {history.length === 0 ? (
        <View style={styles.emptyState}>
          <MessageSquare size={48} color="#666" />
          <Text style={styles.emptyText}>Chưa có cuộc trò chuyện nào</Text>
          <Text style={styles.emptySubtext}>Các cuộc trò chuyện của bạn sẽ xuất hiện ở đây</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [
                styles.historyItem,
                pressed && styles.historyItemPressed,
                currentChatId === item.id && styles.historyItemActive
              ]}
              onPress={() => onSelectChat(item.id)}
            >
              <View style={styles.historyIcon}>
                <MessageSquare size={24} color="#F57C00" />
              </View>
              <View style={styles.historyContent}>
                <Text style={styles.historyTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.historyPreview} numberOfLines={2}>
                  {item.messages[item.messages.length - 1]?.text || ''}
                </Text>
                <View style={styles.historyMeta}>
                  <Clock size={14} color="#999" />
                  <Text style={styles.historyDate}>{formatDate(item.updatedAt)}</Text>
                </View>
              </View>
              <Pressable 
                style={({ pressed }) => [
                  styles.deleteButton,
                  pressed && styles.deleteButtonPressed
                ]}
                onPress={() => onDeleteChat(item.id)}
              >
                <Trash2 size={18} color="#999" />
              </Pressable>
            </Pressable>
          )}
          contentContainerStyle={styles.historyList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    fontWeight: 'bold',
    padding: 16,
    color: '#FFF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    fontWeight: 'bold',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  historyList: {
    padding: 12,
  },
  historyItem: {
    flexDirection: 'row',
    backgroundColor: '#1D1E33',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    alignItems: 'center',
  },
  historyItemPressed: {
    opacity: 0.7,
  },
  historyItemActive: {
    borderColor: '#F57C00',
    borderWidth: 1,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(245, 124, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  historyPreview: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#999',
    marginBottom: 8,
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#999',
    marginLeft: 4,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  deleteButtonPressed: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
  },
}); 