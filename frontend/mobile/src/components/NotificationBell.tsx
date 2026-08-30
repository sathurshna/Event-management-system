import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import api from '../utils/api';
import { useTheme } from '../context/ThemeContext';

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();
  const { colors } = useTheme();
  
  const prevUnreadCountRef = useRef(0);
  const isInitialLoad = useRef(true);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      const unread = response.data.data.filter((n: any) => !n.is_read).length;
      
      if (!isInitialLoad.current && unread > prevUnreadCountRef.current) {
        // Find the newest unread notification to show its message
        const latestUnread = response.data.data.find((n: any) => !n.is_read);
        if (latestUnread) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "New Notification",
              body: latestUnread.message,
              sound: true,
            },
            trigger: null,
          });
        }
      }
      
      setUnreadCount(unread);
      prevUnreadCountRef.current = unread;
      isInitialLoad.current = false;
      
    } catch (error) {
      console.log('Failed to fetch notifications count', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // 10s poll for mobile
    return () => clearInterval(interval);
  }, []);

  return (
    <TouchableOpacity 
      onPress={() => router.push('/(tabs)/notifications')}
      style={{ marginRight: 15, position: 'relative' }}
    >
      <Bell color={colors.textMain} size={24} />
      {unreadCount > 0 && (
        <View style={{
          position: 'absolute',
          top: -5,
          right: -5,
          backgroundColor: colors.error,
          borderRadius: 10,
          width: 20,
          height: 20,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
