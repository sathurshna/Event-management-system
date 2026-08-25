import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import api from '../../src/utils/api';
import { globalStyles, colors, spacing } from '../../src/theme';

interface Notification {
  id: string;
  type: string;
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.data);
    } catch (error) {
      console.log('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
  }, []);

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.log('Failed to mark all as read', error);
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.is_read) {
      try {
        await api.put(`/notifications/${notif.id}/read`);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
      } catch (error) {
        console.log('Failed to mark read', error);
      }
    }

    if (notif.link) {
      try {
        const url = new URL(notif.link);
        const path = url.pathname; // /invites/abc
        
        if (path.startsWith('/invites/')) {
          router.push(path as any); // expo-router will match /invites/[token]
        }
      } catch {
        if (notif.link.startsWith('/invites/')) {
          router.push(notif.link as any);
        }
      }
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <View style={globalStyles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.md }}>
        <Text style={{ color: colors.textMain, fontSize: 24, fontWeight: 'bold' }}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Check color={colors.primary} size={16} />
            <Text style={{ color: colors.primary, marginLeft: 4, fontWeight: 'bold' }}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && !refreshing ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={{ padding: spacing.lg, alignItems: 'center', backgroundColor: colors.surfaceGlass, borderRadius: spacing.md }}>
              <Text style={{ color: colors.textMain, fontSize: 16 }}>No notifications yet.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => handleNotificationClick(item)}
              style={[
                globalStyles.glassCard, 
                { 
                  marginBottom: spacing.md, 
                  marginHorizontal: 0,
                  backgroundColor: item.is_read ? colors.surfaceGlass : 'rgba(99, 102, 241, 0.1)',
                  borderColor: item.is_read ? colors.borderGlass : colors.primary
                }
              ]}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Text style={{ 
                  flex: 1,
                  color: item.is_read ? colors.textMain : 'white', 
                  fontSize: 16, 
                  fontWeight: item.is_read ? 'normal' : 'bold',
                  marginBottom: 8
                }}>
                  {item.message}
                </Text>
                {!item.is_read && (
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary, marginLeft: 10, marginTop: 4 }} />
                )}
              </View>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                {new Date(item.created_at).toLocaleString()}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
