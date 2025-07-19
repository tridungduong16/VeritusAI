import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Search as SearchIcon, Clock, Filter, X } from 'lucide-react-native';
import { useAudio } from '@/contexts/AudioContext';
import { mockNews } from '@/data/mockData';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState(['Bản tin sáng', 'Tài chính', 'Thể thao']);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const { playNews } = useAudio();

  const filters = ['Tất cả', 'Bản tin sáng', 'Tài chính', 'Thể thao', 'Giải trí', 'Tin nhanh'];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = mockNews.filter(news =>
        news.title.toLowerCase().includes(query.toLowerCase()) ||
        news.category.toLowerCase().includes(query.toLowerCase()) ||
        news.description.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handlePlayNews = async (news: any) => {
    await playNews(news);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const toggleFilter = (filter: string) => {
    if (filter === 'Tất cả') {
      setSelectedFilters([]);
    } else {
      setSelectedFilters(prev =>
        prev.includes(filter)
          ? prev.filter(f => f !== filter)
          : [...prev, filter]
      );
    }
  };

  const filteredResults = selectedFilters.length > 0
    ? searchResults.filter(news => selectedFilters.includes(news.category))
    : searchResults;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tìm kiếm</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <SearchIcon size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm tin tức, chuyên mục..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={clearSearch}>
              <X size={20} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                (selectedFilters.includes(filter) || (filter === 'Tất cả' && selectedFilters.length === 0)) && styles.filterChipActive
              ]}
              onPress={() => toggleFilter(filter)}
            >
              <Text style={[
                styles.filterText,
                (selectedFilters.includes(filter) || (filter === 'Tất cả' && selectedFilters.length === 0)) && styles.filterTextActive
              ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Recent Searches */}
      {!searchQuery && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tìm kiếm gần đây</Text>
          {recentSearches.map((search, index) => (
            <TouchableOpacity
              key={index}
              style={styles.recentSearchItem}
              onPress={() => handleSearch(search)}
            >
              <Clock size={16} color="#999" />
              <Text style={styles.recentSearchText}>{search}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Search Results */}
      {searchQuery && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Kết quả cho "{searchQuery}" ({filteredResults.length})
          </Text>
          {filteredResults.map((news) => (
            <TouchableOpacity
              key={news.id}
              style={styles.resultCard}
              onPress={() => handlePlayNews(news)}
            >
              <Image source={{ uri: news.imageUrl }} style={styles.resultImage} />
              <View style={styles.resultContent}>
                <Text style={styles.resultCategory}>{news.category}</Text>
                <Text style={styles.resultTitle} numberOfLines={2}>
                  {news.title}
                </Text>
                <Text style={styles.resultDescription} numberOfLines={2}>
                  {news.description}
                </Text>
                <Text style={styles.resultDuration}>
                  {Math.floor(news.duration / 60)}:{(news.duration % 60).toString().padStart(2, '0')}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Trending Topics */}
      {!searchQuery && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chủ đề thịnh hành</Text>
          <View style={styles.trendingGrid}>
            {['Bầu cử 2024', 'Công nghệ AI', 'Thị trường chứng khoán', 'Thời tiết', 'COVID-19', 'Giá xăng'].map((topic, index) => (
              <TouchableOpacity
                key={index}
                style={styles.trendingTopic}
                onPress={() => handleSearch(topic)}
              >
                <Text style={styles.trendingText}>{topic}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

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
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1D1E33',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#FFF',
  },
  filtersContainer: {
    paddingLeft: 20,
    marginBottom: 24,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1D1E33',
    marginRight: 12,
  },
  filterChipActive: {
    backgroundColor: '#F57C00',
  },
  filterText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#999',
  },
  filterTextActive: {
    color: '#FFF',
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
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  recentSearchText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#FFF',
  },
  resultCard: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#1D1E33',
    borderRadius: 12,
    padding: 12,
  },
  resultImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  resultContent: {
    flex: 1,
    marginLeft: 12,
  },
  resultCategory: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#F57C00',
    marginBottom: 4,
  },
  resultTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFF',
    lineHeight: 22,
    marginBottom: 4,
  },
  resultDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
    marginBottom: 8,
  },
  resultDuration: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#999',
  },
  trendingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  trendingTopic: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1D1E33',
    borderRadius: 20,
  },
  trendingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#FFF',
  },
  bottomSpacing: {
    height: 100,
  },
});