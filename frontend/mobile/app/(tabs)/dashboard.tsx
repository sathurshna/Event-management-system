import React, { useState, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator, Image, Modal, Animated, Dimensions, Alert } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { LogOut, Calendar, Users, Settings, User, X, HelpCircle, ChevronRight, Ticket, Star } from 'lucide-react-native';
import { spacing } from '../../src/theme';
import { useTheme } from '../../src/context/ThemeContext';
import { StatCard } from '../../src/components/StatCard';

const { width } = Dimensions.get('window');
import api from '../../src/utils/api';
import EventCard from '../../src/components/EventCard';
import NotificationBell from '../../src/components/NotificationBell';

interface DashboardStats {
  activeEvents: number;
  totalAttendees: number;
  pendingInvites?: number;
  avgRating?: number;
}

export default function Dashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { colors, globalStyles } = useTheme();
  const [events, setEvents] = useState<any[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ activeEvents: 0, totalAttendees: 0, pendingInvites: 0, avgRating: 0 });
  const [category, setCategory] = useState<'all' | 'hosting' | 'attending'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const slideAnim = useRef(new Animated.Value(width)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const openMenu = () => {
    setShowMenu(true);
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 18,
        stiffness: 100,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: width,
        useNativeDriver: true,
        damping: 20,
        stiffness: 90,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      })
    ]).start(() => setShowMenu(false));
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      // Fetch user's events and stats concurrently
      const [eventsRes, statsRes] = await Promise.all([
        api.get(`/events?limit=20&category=${category}`),
        api.get('/events/stats')
      ]);
      setEvents(eventsRes.data.data);
      setStats(statsRes.data.data);
    } catch (error: any) {
      console.log('Failed to fetch dashboard data', error);
      setErrorMsg(error?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [category])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const renderHeader = () => (
    <View style={{ marginBottom: spacing.lg }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.textMain, fontSize: 26, fontWeight: 'bold', marginBottom: 4 }} numberOfLines={1}>Welcome back, {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={{ color: colors.textMuted, fontSize: 14 }}>Let's make today memorable.</Text>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 12 }}>
          <NotificationBell />
          <TouchableOpacity 
            onPress={openMenu}
            style={{ marginLeft: 12, width: 36, height: 36, borderRadius: 18, overflow: 'hidden', backgroundColor: colors.surfaceSecondary, justifyContent: 'center', alignItems: 'center' }}
          >
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={{ width: '100%', height: '100%' }} />
            ) : (
              <Text style={{ color: colors.textMain, fontWeight: 'bold' }}>{user?.name?.[0]?.toUpperCase() || 'U'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
      

      {/* Section Title */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
        <Text style={{ color: colors.textMain, fontSize: 20, fontWeight: '800', letterSpacing: 0.5 }}>
          {category === 'all' ? 'Discovery (All Public)' : category === 'hosting' ? 'Your Hosted Events' : 'Events You\'re Attending'}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 8, paddingBottom: spacing.lg }}>
        {(['all', 'hosting', 'attending'] as const).map(cat => (
          <TouchableOpacity
            key={cat}
            onPress={() => setCategory(cat)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: category === cat ? colors.primary : colors.surfaceSecondary,
              borderWidth: 1,
              borderColor: category === cat ? colors.primary : colors.border,
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

  const renderSideMenu = () => (
    <Modal visible={showMenu} transparent animationType="none">
      <View style={{ flex: 1, flexDirection: 'row' }}>
          <Animated.View style={{ flex: 1, position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', opacity: fadeAnim }}>
            <TouchableOpacity 
              style={{ flex: 1 }} 
              activeOpacity={1} 
              onPress={closeMenu} 
            />
          </Animated.View>
          
          {/* Spacer to push drawer to the right */}
          <View style={{ flex: 1 }} />

          <Animated.View style={{ 
            width: width * 0.8, 
            backgroundColor: colors.background, 
            height: '100%', 
            transform: [{ translateX: slideAnim }],
            borderTopLeftRadius: 32,
            borderBottomLeftRadius: 32,
            padding: 24,
            paddingTop: 64,
            shadowColor: '#000',
            shadowOffset: { width: -10, height: 0 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 20,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <View style={{ 
                  width: 56, height: 56, borderRadius: 28, overflow: 'hidden', 
                  backgroundColor: colors.surfaceSecondary, justifyContent: 'center', alignItems: 'center',
                  borderWidth: 2, borderColor: colors.primary, padding: 2
                }}>
                  <View style={{ width: '100%', height: '100%', borderRadius: 28, overflow: 'hidden', backgroundColor: colors.surface }}>
                    {user?.avatar ? (
                      <Image source={{ uri: user.avatar }} style={{ width: '100%', height: '100%' }} />
                    ) : (
                      <Text style={{ color: colors.textMain, fontWeight: 'bold', fontSize: 24, alignSelf: 'center', marginTop: 12 }}>{user?.name?.[0]?.toUpperCase() || 'U'}</Text>
                    )}
                  </View>
                </View>
                <View>
                  <Text style={{ color: colors.textMain, fontSize: 22, fontWeight: '900', letterSpacing: 0.5, marginBottom: 2 }}>{user?.name}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: '500' }}>{user?.email}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={closeMenu} style={{ padding: 6, backgroundColor: colors.surfaceSecondary, borderRadius: 100 }}>
                <X color={colors.textMuted} size={20} />
              </TouchableOpacity>
            </View>

            <View style={{ height: 1, backgroundColor: colors.border, marginBottom: 24 }} />

            <View style={{ gap: 8 }}>
              <TouchableOpacity activeOpacity={0.6} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 16, borderRadius: 16, backgroundColor: colors.surfaceSecondary }} onPress={() => { closeMenu(); router.push('/profile'); }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <User color={colors.textMain} size={22} style={{ marginRight: 16 }} />
                  <Text style={{ color: colors.textMain, fontSize: 16, fontWeight: '600' }}>Profile</Text>
                </View>
                <ChevronRight color={colors.textMuted} size={20} />
              </TouchableOpacity>
              
              <TouchableOpacity activeOpacity={0.6} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 16, borderRadius: 16, backgroundColor: colors.surfaceSecondary }} onPress={() => { closeMenu(); router.push('/settings'); }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Settings color={colors.textMain} size={22} style={{ marginRight: 16 }} />
                  <Text style={{ color: colors.textMain, fontSize: 16, fontWeight: '600' }}>Settings</Text>
                </View>
                <ChevronRight color={colors.textMuted} size={20} />
              </TouchableOpacity>

              <TouchableOpacity 
                activeOpacity={0.6} 
                style={{ paddingVertical: 18, paddingHorizontal: 16, borderRadius: 16, backgroundColor: 'rgba(239, 68, 68, 0.1)', marginTop: 24 }} 
                onPress={async () => {
                  closeMenu();
                  await logout();
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <LogOut color={colors.error} size={22} style={{ marginRight: 16 }} />
                    <Text style={{ color: colors.error, fontSize: 16, fontWeight: '600' }}>Logout</Text>
                  </View>
                  <ChevronRight color={colors.error} size={20} opacity={0.5} />
                </View>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
  );

  return (
    <View style={[globalStyles.container, { paddingTop: 60 }]}>
      <View style={{ flex: 1 }}>
        {loading && !refreshing ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : errorMsg ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <Text style={{ color: colors.danger, fontSize: 16 }}>{errorMsg}</Text>
          </View>
        ) : (
        <FlatList
          data={events}
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
      
      {renderSideMenu()}
    </View>
  );
}
