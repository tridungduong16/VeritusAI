import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

export interface NewsItem {
  id: string;
  title: string;
  category: string;
  duration: number;
  imageUrl: string;
  audioUrl: string;
  description: string;
  isQuickNews?: boolean;
  highlights?: string[];
  summary?: string;
}

interface AudioContextType {
  currentNews: NewsItem | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  playbackSpeed: number;
  isBuffering: boolean;
  playNews: (news: NewsItem) => Promise<void>;
  pauseAudio: () => Promise<void>;
  resumeAudio: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  setPlaybackSpeed: (speed: number) => Promise<void>;
  skipForward: () => Promise<void>;
  skipBackward: () => Promise<void>;
  stopAudio: () => Promise<void>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentNews, setCurrentNews] = useState<NewsItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeedState] = useState(1.0);
  const [isBuffering, setIsBuffering] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    const audioModeConfig: any = {};
    
    if (Platform.OS === 'ios') {
      audioModeConfig.allowsRecordingIOS = false;
      audioModeConfig.interruptionModeIOS = Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX;
      audioModeConfig.playsInSilentModeIOS = true;
    }
    
    if (Platform.OS === 'android') {
      audioModeConfig.shouldDuckAndroid = true;
      audioModeConfig.interruptionModeAndroid = Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX;
      audioModeConfig.playThroughEarpieceAndroid = false;
    }
    
    if (Platform.OS !== 'web') {
      Audio.setAudioModeAsync(audioModeConfig);
    }

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const playNews = async (news: NewsItem) => {
    try {
      setIsBuffering(true);
      
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: news.audioUrl },
        { shouldPlay: true }
      );

      soundRef.current = sound;
      setCurrentNews(news);
      setIsPlaying(true);
      setIsBuffering(false);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setPosition(status.positionMillis || 0);
          setDuration(status.durationMillis || 0);
          setIsPlaying(status.isPlaying);
          setIsBuffering(status.isBuffering);
        }
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsBuffering(false);
    }
  };

  const pauseAudio = async () => {
    if (soundRef.current) {
      await soundRef.current.pauseAsync();
    }
  };

  const resumeAudio = async () => {
    if (soundRef.current) {
      await soundRef.current.playAsync();
    }
  };

  const seekTo = async (positionMillis: number) => {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(positionMillis);
    }
  };

  const setPlaybackSpeed = async (speed: number) => {
    if (soundRef.current) {
      await soundRef.current.setRateAsync(speed, true);
      setPlaybackSpeedState(speed);
    }
  };

  const skipForward = async () => {
    const newPosition = Math.min(position + 15000, duration);
    await seekTo(newPosition);
  };

  const skipBackward = async () => {
    const newPosition = Math.max(position - 15000, 0);
    await seekTo(newPosition);
  };

  const stopAudio = async () => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setCurrentNews(null);
    setIsPlaying(false);
    setPosition(0);
    setDuration(0);
  };

  return (
    <AudioContext.Provider
      value={{
        currentNews,
        isPlaying,
        position,
        duration,
        playbackSpeed,
        isBuffering,
        playNews,
        pauseAudio,
        resumeAudio,
        seekTo,
        setPlaybackSpeed,
        skipForward,
        skipBackward,
        stopAudio,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};