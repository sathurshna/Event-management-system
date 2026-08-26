import React, { useState, useCallback } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Share, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { ArrowLeft, Calendar, MapPin, User, Share2, Mail, Edit, Globe, Lock, Trash2 } from 'lucide-react-native';
import api from '../../../src/utils/api';
import { globalStyles, colors, spacing } from '../../../src/theme';
import { useAuth } from '../../../src/context/AuthContext';
import RsvpSection from '../../../src/components/RsvpSection';
import InviteModal from '../../../src/components/InviteModal';

export default function EventDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  const [focusCount, setFocusCount] = useState(0);


  useFocusEffect(
    useCallback(() => {
      const fetchEvent = async () => {
        try {
          const response = await api.get(`/events/${id}`);
          setEvent(response.data.data);
        } catch (error) {
          console.log('Failed to fetch event', error);
        } finally {
          setLoading(false);
        }
      };
      fetchEvent();
      // Increment focusCount so RsvpSection remounts & refetches
      setFocusCount(c => c + 1);
    }, [id])
  );

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${event.title} on NexusEvents!`,
        url: `http://localhost:5173/events/${id}`, // Web URL for sharing
      });
    } catch (error) {
      console.log(error);
    }
  };

  const toggleVisibility = async () => {
    if (!isOwner) return;
    try {
      await api.put(`/events/${id}`, { isPublic: !event.is_public });
      setEvent((prev: any) => ({ ...prev, is_public: !prev.is_public }));
      alert(event.is_public ? 'Event is now private' : 'Event is now public');
    } catch (error) {
      alert('Failed to update event visibility');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Event",
      `Are you sure you want to delete "${event?.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/events/${id}`);
              alert('Event deleted successfully');
              router.replace('/(tabs)');
            } catch (error) {
              alert('Failed to delete event');
            }
          }
        }
      ]
    );
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

  const isOwner = user?.id === event.host_id;

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

          {/* Visibility Toggle Badge Overlay */}
          <TouchableOpacity
            onPress={toggleVisibility}
            disabled={!isOwner}
            style={{
              position: 'absolute', top: 50, right: 75,
              backgroundColor: event.is_public ? colors.secondary : colors.primary,
              paddingHorizontal: 16, paddingVertical: 12, borderRadius: 100,
              flexDirection: 'row', alignItems: 'center'
            }}
          >
            {event.is_public ? <Globe color="white" size={16} /> : <Lock color="white" size={16} />}
            <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 6 }}>
              {event.is_public ? 'Public' : 'Private'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content Area */}
        <View style={{ padding: spacing.lg, paddingBottom: 100 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.lg }}>
            <Text style={{ color: colors.textMain, fontSize: 28, fontWeight: 'bold', flex: 1, marginRight: 16 }}>{event.title}</Text>
            
            {isOwner && (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity 
                  onPress={() => router.push(`/events/${id}/edit`)}
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, flexDirection: 'row', alignItems: 'center' }}
                >
                  <Edit color="white" size={16} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={() => setInviteModalOpen(true)}
                  style={{ backgroundColor: colors.secondary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, flexDirection: 'row', alignItems: 'center' }}
                >
                  <Mail color="white" size={16} style={{ marginRight: 6 }} />
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>Invite</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={handleDelete}
                  style={{ backgroundColor: '#ef4444', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, flexDirection: 'row', alignItems: 'center' }}
                >
                  <Trash2 color="white" size={16} />
                </TouchableOpacity>
              </View>
            )}
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

          {/* RSVP and Attendees */}
          <RsvpSection key={focusCount} eventId={id as string} isOwner={isOwner} hostId={event.host_id} />
        </View>
      </ScrollView>

      <InviteModal 
        isVisible={isInviteModalOpen} 
        onClose={() => setInviteModalOpen(false)} 
        eventId={id as string} 
      />
    </View>
  );
}
