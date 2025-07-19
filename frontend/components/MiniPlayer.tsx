import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Animated } from 'react-native';
import { Play, Pause, SkipForward } from 'lucide-react-native';
import { useAudio } from '@/contexts/AudioContext';
import { useRouter } from 'expo-router';

export function MiniPlayer() {
  const { currentNews, isPlaying, pauseAudio, resumeAudio, position, duration } = useAudio();
  const router = useRouter();

  if (!currentNews) return null;

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  const handlePlayPause = async () => {
    if (isPlaying) {
      await pauseAudio();
    } else {
      await resumeAudio();
    }
  };

  const openFullPlayer = () => {
    router.push('/player');
  };

  return (
    <TouchableOpacity style={styles.container} onPress={openFullPlayer} activeOpacity={0.9}>
      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      
      <View style={styles.content}>
        <Image source={{ uri: currentNews.imageUrl }} style={styles.artwork} />
        
        <View style={styles.textContent}>
          <Text style={styles.title} numberOfLines={1}>
            {currentNews.title}
          </Text>
          <Text style={styles.category} numberOfLines={1}>
            {currentNews.category}
          </Text>
        </View>
        
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handlePlayPause}
          >
            {isPlaying ? (
              <Pause size={20} color="#FFF" fill="#FFF" />
            ) : (
              <Play size={20} color="#FFF" fill="#FFF" />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton}>
            <SkipForward size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    backgroundColor: '#1D1E33',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: 2,
    backgroundColor: '#333',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F57C00',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  artwork: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  textContent: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#FFF',
    marginBottom: 2,
  },
  category: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#999',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(245,124,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});