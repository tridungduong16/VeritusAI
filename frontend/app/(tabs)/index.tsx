import React from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Clock, TrendingUp } from 'lucide-react-native';
import { useAudio } from '@/contexts/AudioContext';
import { mockNews } from '@/data/mockData';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { playNews, currentNews, isPlaying } = useAudio();

  const featuredNews = mockNews.slice(0, 3);
  const morningNews = mockNews.filter(item => item.category === 'Bản tin sáng');
  const quickNews = mockNews.filter(item => item.isQuickNews);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayNews = async (news: any) => {
    if (currentNews?.id === news.id && isPlaying) {
      return;
    }
    await playNews(news);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Chào bạn!</Text>
        <Text style={styles.headerTitle}>Tin tức hôm nay</Text>
      </View>

      {/* Featured Banner */}
      <View style={styles.featuredSection}>
        <Text style={styles.sectionTitle}>Tin nổi bật</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredScroll}>
          {featuredNews.map((news) => (
            <TouchableOpacity
              key={news.id}
              style={styles.featuredCard}
              onPress={() => handlePlayNews(news)}
            >
              <Image source={{ uri: news.imageUrl }} style={styles.featuredImage} />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.featuredGradient}
              >
                <View style={styles.featuredContent}>
                  <Text style={styles.featuredTitle} numberOfLines={2}>
                    {news.title}
                  </Text>
                  <View style={styles.featuredMeta}>
                    <View style={styles.durationBadge}>
                      <Clock size={12} color="#FFF" />
                      <Text style={styles.durationText}>{formatDuration(news.duration)}</Text>
                    </View>
                    <TouchableOpacity style={styles.playButton}>
                      <Play size={16} color="#FFF" fill="#FFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Continue Listening */}
      {currentNews && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tiếp tục nghe</Text>
          <TouchableOpacity style={styles.continueCard}>
            <Image source={{ uri: currentNews.imageUrl }} style={styles.continueImage} />
            <View style={styles.continueContent}>
              <Text style={styles.continueTitle} numberOfLines={2}>
                {currentNews.title}
              </Text>
              <Text style={styles.continueCategory}>{currentNews.category}</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '35%' }]} />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Morning News */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Bản tin sáng</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>
        {morningNews.slice(0, 3).map((news) => (
          <TouchableOpacity
            key={news.id}
            style={styles.newsCard}
            onPress={() => handlePlayNews(news)}
          >
            <Image source={{ uri: news.imageUrl }} style={styles.newsImage} />
            <View style={styles.newsContent}>
              <Text style={styles.newsTitle} numberOfLines={2}>
                {news.title}
              </Text>
              <Text style={styles.newsCategory}>{news.category}</Text>
              <View style={styles.newsMeta}>
                <Text style={styles.newsDuration}>{formatDuration(news.duration)}</Text>
                <View style={styles.trendingBadge}>
                  <TrendingUp size={12} color="#F57C00" />
                  <Text style={styles.trendingText}>Nổi bật</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.newsPlayButton}>
              <Play size={20} color="#F57C00" fill="#F57C00" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick News */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tin nhanh</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Phát tất cả</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {quickNews.map((news) => (
            <TouchableOpacity
              key={news.id}
              style={styles.quickNewsCard}
              onPress={() => handlePlayNews(news)}
            >
              <Image source={{ uri: news.imageUrl }} style={styles.quickNewsImage} />
              <Text style={styles.quickNewsTitle} numberOfLines={3}>
                {news.title}
              </Text>
              <Text style={styles.quickNewsDuration}>{formatDuration(news.duration)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Bottom spacing for mini player */}
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
    paddingBottom: 20,
  },
  greeting: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#999',
    marginBottom: 4,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: '#FFF',
  },
  featuredSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: '#FFF',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  featuredScroll: {
    paddingLeft: 20,
  },
  featuredCard: {
    width: width * 0.8,
    height: 200,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
    justifyContent: 'flex-end',
    padding: 16,
  },
  featuredContent: {
    gap: 12,
  },
  featuredTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFF',
    lineHeight: 22,
  },
  featuredMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  durationText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#FFF',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(245,124,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  seeAll: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#F57C00',
  },
  continueCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: '#1D1E33',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  continueImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  continueContent: {
    flex: 1,
    marginLeft: 16,
  },
  continueTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFF',
    marginBottom: 4,
  },
  continueCategory: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F57C00',
    borderRadius: 2,
  },
  newsCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  newsImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  newsContent: {
    flex: 1,
    marginLeft: 16,
  },
  newsTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFF',
    marginBottom: 4,
    lineHeight: 22,
  },
  newsCategory: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#F57C00',
    marginBottom: 8,
  },
  newsMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  newsDuration: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#999',
  },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#F57C00',
  },
  newsPlayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(245,124,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  quickNewsCard: {
    width: 140,
    marginRight: 16,
    marginLeft: 4,
  },
  quickNewsImage: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    marginBottom: 8,
  },
  quickNewsTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#FFF',
    lineHeight: 18,
    marginBottom: 6,
  },
  quickNewsDuration: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#999',
  },
  bottomSpacing: {
    height: 100,
  },
});