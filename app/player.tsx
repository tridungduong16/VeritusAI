import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import { 
  ChevronDown, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Download, 
  Heart, 
  Share,
  Timer,
  Repeat,
  Shuffle
} from 'lucide-react-native';
import { useAudio } from '@/contexts/AudioContext';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function PlayerScreen() {
  const router = useRouter();
  const {
    currentNews,
    isPlaying,
    position,
    duration,
    playbackSpeed,
    pauseAudio,
    resumeAudio,
    seekTo,
    setPlaybackSpeed,
    skipForward,
    skipBackward,
  } = useAudio();

  const [volume, setVolume] = useState(0.8);
  const [isSaved, setIsSaved] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

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

  const handleSeek = async (value: number) => {
    const newPosition = (value * duration) / 100;
    await seekTo(newPosition);
  };

  const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  const handleSpeedChange = async (speed: number) => {
    await setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1D1E33', '#121212', '#121212']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronDown size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đang phát</Text>
          <TouchableOpacity style={styles.headerButton}>
            <Share size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Artwork */}
        <View style={styles.artworkContainer}>
          <Image source={{ uri: currentNews.imageUrl }} style={styles.artwork} />
        </View>

        {/* Track Info */}
        <View style={styles.trackInfo}>
          <Text style={styles.trackTitle}>{currentNews.title}</Text>
          <Text style={styles.trackCategory}>{currentNews.category}</Text>
          {currentNews.description && (
            <Text style={styles.trackDescription} numberOfLines={2}>
              {currentNews.description}
            </Text>
          )}
        </View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <Slider
            style={styles.progressSlider}
            minimumValue={0}
            maximumValue={100}
            value={duration > 0 ? (position / duration) * 100 : 0}
            onSlidingComplete={handleSeek}
            minimumTrackTintColor="#F57C00"
            maximumTrackTintColor="#333"
            thumbStyle={styles.sliderThumb}
          />
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>

        {/* Main Controls */}
        <View style={styles.mainControls}>
          <TouchableOpacity style={styles.controlButton} onPress={skipBackward}>
            <SkipBack size={32} color="#FFF" fill="#FFF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
            {isPlaying ? (
              <Pause size={36} color="#FFF" fill="#FFF" />
            ) : (
              <Play size={36} color="#FFF" fill="#FFF" />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton} onPress={skipForward}>
            <SkipForward size={32} color="#FFF" fill="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Secondary Controls */}
        <View style={styles.secondaryControls}>
          <TouchableOpacity style={styles.secondaryButton}>
            <Shuffle size={20} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => setShowSpeedMenu(!showSpeedMenu)}
          >
            <Text style={styles.speedText}>{playbackSpeed}x</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton}>
            <Timer size={20} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton}>
            <Repeat size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Speed Menu */}
        {showSpeedMenu && (
          <View style={styles.speedMenu}>
            {speeds.map((speed) => (
              <TouchableOpacity
                key={speed}
                style={[
                  styles.speedOption,
                  playbackSpeed === speed && styles.activeSpeedOption
                ]}
                onPress={() => handleSpeedChange(speed)}
              >
                <Text style={[
                  styles.speedOptionText,
                  playbackSpeed === speed && styles.activeSpeedOptionText
                ]}>
                  {speed}x
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, isSaved && styles.savedButton]}
            onPress={() => setIsSaved(!isSaved)}
          >
            <Heart size={20} color={isSaved ? "#FFF" : "#999"} fill={isSaved ? "#FFF" : "none"} />
            <Text style={[styles.actionText, isSaved && styles.savedText]}>
              {isSaved ? 'Đã lưu' : 'Lưu'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Download size={20} color="#999" />
            <Text style={styles.actionText}>Tải về</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Volume2 size={20} color="#999" />
            <Text style={styles.actionText}>Âm lượng</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFF',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  artworkContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  artwork: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 20,
  },
  trackInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  trackTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 30,
  },
  trackCategory: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#F57C00',
    marginBottom: 12,
  },
  trackDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  progressContainer: {
    marginBottom: 40,
  },
  progressSlider: {
    width: '100%',
    height: 40,
  },
  sliderThumb: {
    backgroundColor: '#F57C00',
    width: 16,
    height: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#999',
  },
  mainControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    gap: 40,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F57C00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    gap: 32,
  },
  secondaryButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#999',
  },
  speedMenu: {
    position: 'absolute',
    bottom: 200,
    left: 20,
    right: 20,
    backgroundColor: '#1D1E33',
    borderRadius: 12,
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  speedOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  activeSpeedOption: {
    backgroundColor: '#F57C00',
  },
  speedOptionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#999',
  },
  activeSpeedOptionText: {
    color: '#FFF',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
  },
  savedButton: {
    backgroundColor: 'rgba(245,124,0,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  actionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#999',
  },
  savedText: {
    color: '#F57C00',
  },
});