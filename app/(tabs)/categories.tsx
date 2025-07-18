import React from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Image } from 'react-native';
import { Play, Users, Clock } from 'lucide-react-native';
import { useAudio } from '@/contexts/AudioContext';
import { mockCategories, mockNews } from '@/data/mockData';

export default function CategoriesScreen() {
  const { playNews } = useAudio();

  const handlePlayNews = async (news: any) => {
    await playNews(news);
  };

  const handlePlayCategory = async (categoryName: string) => {
    const categoryNews = mockNews.filter(news => news.category === categoryName);
    if (categoryNews.length > 0) {
      await playNews(categoryNews[0]);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chuyên mục</Text>
        <Text style={styles.headerSubtitle}>Khám phá tin tức theo chủ đề</Text>
      </View>

      {/* Categories Grid */}
      <View style={styles.categoriesGrid}>
        {mockCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryCard}
            onPress={() => handlePlayCategory(category.name)}
          >
            <Image source={{ uri: category.imageUrl }} style={styles.categoryImage} />
            <View style={styles.categoryOverlay}>
              <Text style={styles.categoryName}>{category.name}</Text>
              <View style={styles.categoryMeta}>
                <View style={styles.metaItem}>
                  <Users size={12} color="#FFF" />
                  <Text style={styles.metaText}>{category.subscriberCount}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Clock size={12} color="#FFF" />
                  <Text style={styles.metaText}>{category.episodeCount} tập</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.categoryPlayButton}>
                <Play size={16} color="#FFF" fill="#FFF" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Latest Episodes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tập mới nhất</Text>
        {mockNews.slice(0, 5).map((news) => (
          <TouchableOpacity
            key={news.id}
            style={styles.episodeCard}
            onPress={() => handlePlayNews(news)}
          >
            <Image source={{ uri: news.imageUrl }} style={styles.episodeImage} />
            <View style={styles.episodeContent}>
              <Text style={styles.episodeCategory}>{news.category}</Text>
              <Text style={styles.episodeTitle} numberOfLines={2}>
                {news.title}
              </Text>
              <Text style={styles.episodeDescription} numberOfLines={2}>
                {news.description}
              </Text>
              <View style={styles.episodeMeta}>
                <Text style={styles.episodeDuration}>
                  {Math.floor(news.duration / 60)}:{(news.duration % 60).toString().padStart(2, '0')}
                </Text>
                <Text style={styles.episodeDate}>Hôm nay</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.episodePlayButton}>
              <Play size={20} color="#F57C00" fill="#F57C00" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bottom spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
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
  categoriesGrid: {
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 32,
  },
  categoryCard: {
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 16,
    justifyContent: 'space-between',
  },
  categoryName: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#FFF',
  },
  categoryMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#FFF',
  },
  categoryPlayButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(245,124,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: '#FFF',
    marginBottom: 16,
  },
  episodeCard: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  episodeImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  episodeContent: {
    flex: 1,
    marginLeft: 16,
  },
  episodeCategory: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#F57C00',
    marginBottom: 4,
  },
  episodeTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFF',
    lineHeight: 22,
    marginBottom: 4,
  },
  episodeDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
    marginBottom: 8,
  },
  episodeMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  episodeDuration: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#999',
  },
  episodeDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#999',
  },
  episodePlayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(245,124,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  bottomSpacing: {
    height: 100,
  },
});