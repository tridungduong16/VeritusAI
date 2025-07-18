import React from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { Clock, MessageSquare } from 'lucide-react-native';

type ChatHistoryItem = {
  id: string;
  title: string;
  date: Date;
  previewText: string;
};

type ChatHistoryProps = {
  history: ChatHistoryItem[];
  onSelectChat: (id: string) => void;
};

export const ChatHistory: React.FC<ChatHistoryProps> = ({ history, onSelectChat }) => {
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
          <MessageSquare size={48} color="#ccc" />
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
                pressed && styles.historyItemPressed
              ]}
              onPress={() => onSelectChat(item.id)}
            >
              <View style={styles.historyIcon}>
                <MessageSquare size={24} color="#0066cc" />
              </View>
              <View style={styles.historyContent}>
                <Text style={styles.historyTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.historyPreview} numberOfLines={2}>{item.previewText}</Text>
                <View style={styles.historyMeta}>
                  <Clock size={14} color="#888" />
                  <Text style={styles.historyDate}>{formatDate(item.date)}</Text>
                </View>
              </View>
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
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 16,
    color: '#333',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  },
  historyList: {
    padding: 12,
  },
  historyItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  historyItemPressed: {
    opacity: 0.7,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 102, 204, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  historyPreview: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyDate: {
    fontSize: 12,
    color: '#888',
    marginLeft: 4,
  },
}); 