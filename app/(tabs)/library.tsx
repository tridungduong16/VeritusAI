import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Image } from 'react-native';
import { Play, Download, Heart, List, Clock, MoveVertical as MoreVertical } from 'lucide-react-native';
import { useAudio } from '@/contexts/AudioContext';
import { mockNews } from '@/data/mockData';

export default function LibraryScreen() {
  const [activeTab, setActiveTab] = useState('saved');
  const { playNews } = useAudio();

  const tabs = [
    { id: 'saved', label: 'Đã lưu', icon: Heart },
    { id: 'downloaded', label: 'Đã tải', icon: Download },
    { id: 'playlists', label: 'Playlist', icon: List },
    { id: 'history', label: 'Lịch sử', icon: Clock },
  ];

  const savedNews = mockNews.slice(0, 4);
  const downloadedNews = mockNews.slice(2, 5);
  const playlists = [
    { id: '1', name: 'Tin buổi sáng', count: 12, imageUrl: 'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg' },
    { id: '2', name: 'Tài chính cá nhân', count: 8, imageUrl: 'https://images.pexels.com/photos/159888/pexels-photo-159888.jpeg' },
    { id: '3', name: 'Thể thao tuần', count: 15, imageUrl: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg' },
  ];
  const historyNews = mockNews.slice(1, 6);

  const handlePlayNews = async (news: any) => {
    await playNews(news);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'saved':
        return (
          <View>
            {savedNews.map((news) => (
              <TouchableOpacity
                key={news.id}
                style={styles.itemCard}
                onPress={() => handlePlayNews(news)}
              >
                <Image source={{ uri: news.imageUrl }} style={styles.itemImage} />
                <View style={styles.itemContent}>
                  <Text style={styles.itemCategory}>{news.category}</Text>
                  <Text style={styles.itemTitle} numberOfLines={2}>
                    {news.title}
                  </Text>
                  <Text style={styles.itemDuration}>
                    {Math.floor(news.duration / 60)}:{(news.duration % 60).toString().padStart(2, '0')}
                  </Text>
                </View>
                <TouchableOpacity style={styles.moreButton}>
                  <MoreVertical size={20} color="#999" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        );
      
      case 'downloaded':
        return (
          <View>
            <View style={styles.downloadInfo}>
              <Download size={16} color="#F57C00" />
              <Text style={styles.downloadText}>
                {downloadedNews.length} tin tức đã tải • 45.2 MB
              </Text>
            </View>
            {downloadedNews.map((news) => (
              <TouchableOpacity
                key={news.id}
                style={styles.itemCard}
                onPress={() => handlePlayNews(news)}
              >
                <Image source={{ uri: news.imageUrl }} style={styles.itemImage} />
                <View style={styles.itemContent}>
                  <Text style={styles.itemCategory}>{news.category}</Text>
                  <Text style={styles.itemTitle} numberOfLines={2}>
                    {news.title}
                  </Text>
                  <Text style={styles.itemDuration}>
                    {Math.floor(news.duration / 60)}:{(news.duration % 60).toString().padStart(2, '0')} • Đã tải
                  </Text>
                </View>
                <TouchableOpacity style={styles.moreButton}>
                  <MoreVertical size={20} color="#999" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        );
      
      case 'playlists':
        return (
          <View>
            <TouchableOpacity style={styles.createPlaylistButton}>
              <Text style={styles.createPlaylistText}>+ Tạo playlist mới</Text>
            </TouchableOpacity>
            {playlists.map((playlist) => (
              <TouchableOpacity key={playlist.id} style={styles.playlistCard}>
                <Image source={{ uri: playlist.imageUrl }} style={styles.playlistImage} />
                <View style={styles.playlistContent}>
                  <Text style={styles.playlistName}>{playlist.name}</Text>
                  <Text style={styles.playlistCount}>{playlist.count} tin tức</Text>
                </View>
                <TouchableOpacity style={styles.playlistPlayButton}>
                  <Play size={16} color="#F57C00" fill="#F57C00" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        );
      
      case 'history':
        return (
          <View>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>Gần đây</Text>
              <TouchableOpacity>
                <Text style={styles.clearHistory}>Xóa lịch sử</Text>
              </TouchableOpacity>
            </View>
            {historyNews.map((news, index) => (
              <TouchableOpacity
                key={news.id}
                style={styles.historyItem}
                onPress={() => handlePlayNews(news)}
              >
                <Text style={styles.historyTime}>
                  {index === 0 ? 'Vừa xong' : `${index + 1} giờ trước`}
                </Text>
                <View style={styles.historyContent}>
                  <Image source={{ uri: news.imageUrl }} style={styles.historyImage} />
                  <View style={styles.historyText}>
                    <Text style={styles.historyCategory}>{news.category}</Text>
                    <Text style={styles.historyTitle} numberOfLines={2}>
                      {news.title}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thư viện</Text>
        <Text style={styles.headerSubtitle}>Nội dung của bạn</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tab, activeTab === tab.id && styles.activeTab]}
                onPress={() => setActiveTab(tab.id)}
              >
                <IconComponent
                  size={16}
                  color={activeTab === tab.id ? '#FFF' : '#999'}
                />
                <Text style={[
                  styles.tabText,
                  activeTab === tab.id && styles.activeTabText
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderContent()}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: '#FFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#999',
  },
  tabContainer: {
    paddingLeft: 20,
    marginBottom: 24,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1D1E33',
    marginRight: 12,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#F57C00',
  },
  tabText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#999',
  },
  activeTabText: {
    color: '#FFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  itemCard: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  itemContent: {
    flex: 1,
    marginLeft: 16,
  },
  itemCategory: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#F57C00',
    marginBottom: 4,
  },
  itemTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFF',
    lineHeight: 22,
    marginBottom: 4,
  },
  itemDuration: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#999',
  },
  moreButton: {
    padding: 8,
  },
  downloadInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1D1E33',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  downloadText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#FFF',
  },
  createPlaylistButton: {
    backgroundColor: '#F57C00',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  createPlaylistText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFF',
  },
  playlistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  playlistImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  playlistContent: {
    flex: 1,
    marginLeft: 16,
  },
  playlistName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFF',
    marginBottom: 4,
  },
  playlistCount: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#999',
  },
  playlistPlayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(245,124,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  historyTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#FFF',
  },
  clearHistory: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#F57C00',
  },
  historyItem: {
    marginBottom: 20,
  },
  historyTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  historyContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  historyText: {
    flex: 1,
    marginLeft: 12,
  },
  historyCategory: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#F57C00',
    marginBottom: 4,
  },
  bottomSpacing: {
    height: 100,
  },
});