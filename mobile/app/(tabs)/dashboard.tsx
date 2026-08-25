import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { globalStyles, colors, spacing } from '../../src/theme';
import { LogOut } from 'lucide-react-native';
import api from '../../src/utils/api';
import EventCard from '../../src/components/EventCard';
import NotificationBell from '../../src/components/NotificationBell';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [category, setCategory] = useState<'all' | 'hosting' | 'attending'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = async () => {
    try {
      // Fetch user's events
      const response = await api.get('/events?limit=20');
      setEvents(response.data.data);
    } catch (error) {
      console.log('Failed to fetch events', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvents();
  }, []);

  const renderHeader = () => (
    <View style={{ marginBottom: spacing.lg }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
        <Text style={{ color: colors.textMain, fontSize: 28, fontWeight: 'bold' }}>Dashboard</Text>
        
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <NotificationBell />
          <TouchableOpacity 
            onPress={logout}
            style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.error, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}
          >
            <LogOut color="white" size={16} />
            <Text style={{ color: 'white', marginLeft: 8, fontWeight: 'bold' }}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={{ color: colors.textMuted, fontSize: 16, marginBottom: spacing.md }}>Welcome back, {user?.name}</Text>
      
      <View style={{ flexDirection: 'row', gap: 8, paddingBottom: 4 }}>
        {(['all', 'hosting', 'attending'] as const).map(cat => (
          <TouchableOpacity
            key={cat}
            onPress={() => setCategory(cat)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: category === cat ? colors.primary : 'rgba(255,255,255,0.05)',
            }}
          >
            <Text style={{
              color: category === cat ? 'white' : colors.textMuted,
              fontWeight: '600',
              textTransform: 'capitalize'
            }}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  let filteredEvents = events;
  if (category === 'hosting') {
    filteredEvents = events.filter(e => e.host_id === user?.id);
  } else if (category === 'attending') {
    filteredEvents = events.filter(e => e.host_id !== user?.id);
  }

  return (
    <View style={[globalStyles.container, { paddingTop: 60 }]}>
      {loading && !refreshing ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <EventCard {...item} />}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={{ padding: spacing.lg, alignItems: 'center', backgroundColor: colors.surfaceGlass, borderRadius: spacing.md }}>
              <Text style={{ color: colors.textMain, fontSize: 18, marginBottom: 8 }}>No events found</Text>
              <Text style={{ color: colors.textMuted, textAlign: 'center' }}>Pull down to refresh or create an event on the web app.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
