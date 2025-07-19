import React from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Switch } from 'react-native';
import { User, Settings, Bell, Download, Car, Moon, Volume2, Clock, Share, Shield, CircleHelp as HelpCircle } from 'lucide-react-native';

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [autoDownload, setAutoDownload] = React.useState(false);
  const [darkMode, setDarkMode] = React.useState(true);

  const profileStats = [
    { label: 'Tin đã nghe', value: '127' },
    { label: 'Thời gian nghe', value: '24h 15m' },
    { label: 'Chuyên mục theo dõi', value: '8' },
  ];

  const menuItems = [
    {
      title: 'Cài đặt âm thanh',
      subtitle: 'Giọng đọc, tốc độ, chất lượng',
      icon: Volume2,
      onPress: () => {},
    },
    {
      title: 'Thông báo',
      subtitle: 'Bản tin sáng, nhắc nhở nghe',
      icon: Bell,
      onPress: () => {},
      hasSwitch: true,
      switchValue: notificationsEnabled,
      onSwitchChange: setNotificationsEnabled,
    },
    {
      title: 'Tự động tải về',
      subtitle: 'Tải tin mới khi có WiFi',
      icon: Download,
      onPress: () => {},
      hasSwitch: true,
      switchValue: autoDownload,
      onSwitchChange: setAutoDownload,
    },
    {
      title: 'Chế độ lái xe',
      subtitle: 'Giao diện tối ưu cho di chuyển',
      icon: Car,
      onPress: () => {},
    },
    {
      title: 'Sleep Timer',
      subtitle: 'Hẹn giờ tắt âm thanh',
      icon: Clock,
      onPress: () => {},
    },
    {
      title: 'Chế độ tối',
      subtitle: 'Giao diện tối cho mắt',
      icon: Moon,
      onPress: () => {},
      hasSwitch: true,
      switchValue: darkMode,
      onSwitchChange: setDarkMode,
    },
  ];

  const otherItems = [
    {
      title: 'Chia sẻ ứng dụng',
      icon: Share,
      onPress: () => {},
    },
    {
      title: 'Chính sách riêng tư',
      icon: Shield,
      onPress: () => {},
    },
    {
      title: 'Trung tâm trợ giúp',
      icon: HelpCircle,
      onPress: () => {},
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <User size={32} color="#FFF" />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>Người dùng VeritusAI</Text>
            <Text style={styles.userEmail}>Premium Member</Text>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        {profileStats.map((stat, index) => (
          <View key={index} style={styles.statItem}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Settings Menu */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cài đặt</Text>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIcon}>
                <item.icon size={20} color="#F57C00" />
              </View>
              <View style={styles.menuText}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
            </View>
            {item.hasSwitch ? (
              <Switch
                value={item.switchValue}
                onValueChange={item.onSwitchChange}
                trackColor={{ false: '#333', true: '#F57C00' }}
                thumbColor="#FFF"
              />
            ) : (
              <View style={styles.menuArrow}>
                <Text style={styles.arrowText}>›</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Other Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Khác</Text>
        {otherItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIcon}>
                <item.icon size={20} color="#999" />
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
            </View>
            <View style={styles.menuArrow}>
              <Text style={styles.arrowText}>›</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* App Version */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>VeritusAI v1.0.0</Text>
        <Text style={styles.versionSubtext}>Cập nhật mới nhất: 15/01/2025</Text>
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
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F57C00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDetails: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#FFF',
    marginBottom: 4,
  },
  userEmail: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#F57C00',
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 32,
    backgroundColor: '#1D1E33',
    borderRadius: 16,
    padding: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#FFF',
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#FFF',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2B3D',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(245,124,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFF',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#999',
  },
  menuArrow: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontFamily: 'Inter-Regular',
    fontSize: 20,
    color: '#999',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  versionSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#666',
  },
  bottomSpacing: {
    height: 100,
  },
});