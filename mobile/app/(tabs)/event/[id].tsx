import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Calendar, MapPin, User, Share2 } from 'lucide-react-native';
import api from '../../../src/utils/api';
import { globalStyles, colors, spacing } from '../../../src/theme';

export default function EventDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(`/events/${id}`);
        setEvent(response.data.data);
      } catch (error) {
        console.error('Failed to fetch event', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${event.title} on NexusEvents!`,
        url: `http://localhost:5173/events/${id}`, // Web URL for sharing
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.textMain }}>Event not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={[globalStyles.button, { paddingHorizontal: 24, marginTop: 16 }]}>
          <Text style={globalStyles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <View style={globalStyles.container}>
      <ScrollView bounces={false}>
        {/* Header Image Area */}
        <View style={{ position: 'relative', height: 300, backgroundColor: colors.borderGlass }}>
          {event.cover_image ? (
            <Image source={{ uri: event.cover_image }} style={{ width: '100%', height: '100%' }} />
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: colors.textMuted }}>No Cover Image</Text>
            </View>
          )}

          {/* Back Button Overlay */}
          <TouchableOpacity 
            onPress={() => router.back()}
            style={{ position: 'absolute', top: 50, left: 16, backgroundColor: 'rgba(0,0,0,0.5)', padding: 12, borderRadius: 100 }}
          >
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>

          {/* Share Button Overlay */}
          <TouchableOpacity 
            onPress={handleShare}
            style={{ position: 'absolute', top: 50, right: 16, backgroundColor: 'rgba(0,0,0,0.5)', padding: 12, borderRadius: 100 }}
          >
            <Share2 color="white" size={24} />
          </TouchableOpacity>
        </View>

        {/* Content Area */}
        <View style={{ padding: spacing.lg, paddingBottom: 100 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.lg }}>
            <Text style={{ color: colors.textMain, fontSize: 28, fontWeight: 'bold', flex: 1 }}>{event.title}</Text>
          </View>

          {/* Info Blocks */}
          <View style={[globalStyles.glassCard, { marginHorizontal: 0, marginBottom: spacing.xl, padding: spacing.md, gap: 16 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: 10, borderRadius: 12, marginRight: 16 }}>
                <Calendar color={colors.primary} size={24} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>Date & Time</Text>
                <Text style={{ color: colors.textMain, fontSize: 16, fontWeight: '500' }}>{formattedDate}</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: 10, borderRadius: 12, marginRight: 16 }}>
                <MapPin color={colors.primary} size={24} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>Location</Text>
                <Text style={{ color: colors.textMain, fontSize: 16, fontWeight: '500' }}>{event.location}</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: 10, borderRadius: 12, marginRight: 16 }}>
                <User color={colors.primary} size={24} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>Hosted By</Text>
                <Text style={{ color: colors.textMain, fontSize: 16, fontWeight: '500' }}>{event.host_name || 'You'}</Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <Text style={{ color: colors.textMain, fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>About this event</Text>
          <Text style={{ color: colors.textMuted, fontSize: 16, lineHeight: 24 }}>
            {event.description}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
