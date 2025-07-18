import { Tabs } from 'expo-router';
import { Chrome as Home, Headphones, Search, Library, User, MessageSquare } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { MiniPlayer } from '@/components/MiniPlayer';

export default function TabLayout() {
  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: '#F57C00',
          tabBarInactiveTintColor: '#666',
          tabBarLabelStyle: styles.tabLabel,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Trang chủ',
            tabBarIcon: ({ size, color }) => (
              <Home size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="categories"
          options={{
            title: 'Chuyên mục',
            tabBarIcon: ({ size, color }) => (
              <Headphones size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Tìm kiếm',
            tabBarIcon: ({ size, color }) => (
              <Search size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: 'Thư viện',
            tabBarIcon: ({ size, color }) => (
              <Library size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Cá nhân',
            tabBarIcon: ({ size, color }) => (
              <User size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: 'Trò chuyện',
            tabBarIcon: ({ size, color }) => (
              <MessageSquare size={size} color={color} />
            ),
          }}
        />
      </Tabs>
      <MiniPlayer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  tabBar: {
    backgroundColor: '#1D1E33',
    borderTopColor: '#2A2B3D',
    borderTopWidth: 1,
    height: 80,
    paddingBottom: 20,
    paddingTop: 10,
  },
  tabLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
  },
});