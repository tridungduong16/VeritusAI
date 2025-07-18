import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { X, Play, Pause, SkipForward, SkipBack } from 'lucide-react-native';
import { useAudio } from '@/contexts/AudioContext';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function CarModeScreen() {
  const router = useRouter();
  const {
    currentNews,
    isPlaying,
    position,
    duration,
    pauseAudio,
    resumeAudio,
    skipForward,
    skipBackward,
  } = useAudio();

  if (!currentNews) {
    router.back();
    return null;
  }

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = async () => {
    if (isPlaying) {
      await pauseAudio();
    } else {
      await resumeAudio();
    }
  };

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={32} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chế độ lái xe</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Artwork and Info */}
        <View style={styles.trackSection}>
          <Image source={{ uri: currentNews.imageUrl }} style={styles.artwork} />
          <View style={styles.trackInfo}>
            <Text style={styles.trackTitle} numberOfLines={2}>
              {currentNews.title}
            </Text>
            <Text style={styles.trackCategory}>{currentNews.category}</Text>
            <View style={styles.timeInfo}>
              <Text style={styles.timeText}>
                {formatTime(position)} / {formatTime(duration)}
              </Text>
            </View>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        {/* Large Controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.largeButton} onPress={skipBackward}>
            <SkipBack size={48} color="#FFF" fill="#FFF" />
            <Text style={styles.buttonLabel}>15s</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
            {isPlaying ? (
              <Pause size={60} color="#FFF" fill="#FFF" />
            ) : (
              <Play size={60} color="#FFF" fill="#FFF" />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.largeButton} onPress={skipForward}>
            <SkipForward size={48} color="#FFF" fill="#FFF" />
            <Text style={styles.buttonLabel}>15s</Text>
          </TouchableOpacity>
        </View>

        {/* Voice Commands Info */}
        <View style={styles.voiceCommands}>
          <Text style={styles.voiceTitle}>Điều khiển bằng giọng nói</Text>
          <Text style={styles.voiceText}>
            "Tạm dừng" • "Tiếp tục" • "Chuyển tiếp" • "Quay lại"
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  closeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#FFF',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  trackSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  artwork: {
    width: 120,
    height: 120,
    borderRadius: 16,
  },
  trackInfo: {
    flex: 1,
    marginLeft: 24,
  },
  trackTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: '#FFF',
    lineHeight: 36,
    marginBottom: 8,
  },
  trackCategory: {
    fontFamily: 'Inter-Medium',
    fontSize: 20,
    color: '#F57C00',
    marginBottom: 12,
  },
  timeInfo: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  timeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#FFF',
  },
  progressContainer: {
    marginBottom: 60,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F57C00',
    borderRadius: 4,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
    gap: 60,
  },
  largeButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#F57C00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#FFF',
    marginTop: 8,
  },
  voiceCommands: {
    alignItems: 'center',
    backgroundColor: 'rgba(29,30,51,0.8)',
    borderRadius: 16,
    padding: 24,
  },
  voiceTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: '#FFF',
    marginBottom: 12,
  },
  voiceText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
  },
});