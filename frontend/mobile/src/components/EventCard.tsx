import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Calendar, MapPin } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { borderRadius, spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';

interface EventCardProps {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  cover_image: string;
  is_public?: boolean;
}

export default function EventCard({ id, title, description, date, location, cover_image, is_public }: EventCardProps) {
  const router = useRouter();
  const { colors, globalStyles } = useTheme();
  
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const isPast = new Date(date) < new Date();
  let badgeColor = colors.primary;
  let badgeText = '';
  let badgeTextColor = '#ffffff';

  if (isPast) {
    badgeColor = '#4B5563'; // Gray
    badgeText = 'Past';
  } else if (is_public) {
    badgeColor = '#EAB308'; // Yellow
    badgeText = 'Public';
    badgeTextColor = '#000000'; // Dark text for yellow
  } else {
    badgeColor = '#D946EF'; // Magenta
    badgeText = 'Private';
  }

  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={() => router.push(`/(tabs)/event/${id}`)}
      style={[globalStyles.glassCard, { padding: 0, overflow: 'hidden', marginBottom: spacing.md, marginHorizontal: 0 }]}
    >
      <View style={{ height: 180, position: 'relative' }}>
        <Image
          source={{ uri: cover_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1000&auto=format&fit=crop' }}
          style={{ width: '100%', height: '100%' }}
        />
        
        {/* Date Badge */}
        <View style={{
          position: 'absolute', top: 12, left: 12,
          backgroundColor: 'rgba(8,11,18,0.7)', padding: 8, borderRadius: 12,
          alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          <Text style={{ color: colors.textMain, fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>
            {new Date(date).toLocaleString('default', { month: 'short' })}
          </Text>
          <Text style={{ color: colors.textMain, fontSize: 18, fontWeight: 'bold' }}>
            {new Date(date).getDate()}
          </Text>
        </View>

        {/* Event Status Badge */}
        {(is_public !== undefined || isPast) && (
          <View style={{
            position: 'absolute', top: 12, right: 12,
            backgroundColor: badgeColor,
            paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20
          }}>
            <Text style={{ color: badgeTextColor, fontSize: 12, fontWeight: 'bold' }}>
              {badgeText}
            </Text>
          </View>
        )}
      </View>

      {/* Event Details */}
      <View style={{ padding: 16 }}>
        <Text style={{ color: colors.textMain, fontSize: 20, fontWeight: 'bold', marginBottom: 6 }} numberOfLines={1}>
          {title}
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: 16 }} numberOfLines={2}>
          {description || 'No description provided.'}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Calendar color={colors.textMuted} size={16} style={{ marginRight: 6 }} />
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>
              {new Date(date).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MapPin color={colors.textMuted} size={16} style={{ marginRight: 6 }} />
            <Text style={{ color: colors.textMuted, fontSize: 13 }} numberOfLines={1}>
              {location}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
