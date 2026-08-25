import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Calendar, MapPin } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { globalStyles, colors, borderRadius, spacing } from '../theme';

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
  
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={() => router.push(`/(tabs)/event/${id}`)}
      style={[globalStyles.glassCard, { padding: 0, overflow: 'hidden', marginBottom: spacing.md, marginHorizontal: 0 }]}
    >
      <View style={{ height: 160, backgroundColor: colors.borderGlass, position: 'relative' }}>
        {cover_image ? (
          <Image source={{ uri: cover_image }} style={{ width: '100%', height: '100%' }} />
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: colors.textMuted }}>No Image</Text>
          </View>
        )}
        
        {is_public !== undefined && (
          <View style={{
            position: 'absolute', top: 12, right: 12,
            backgroundColor: is_public ? colors.secondary : colors.primary,
            paddingHorizontal: 12, paddingVertical: 4, borderRadius: 100
          }}>
            <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
              {is_public ? 'Public' : 'Private'}
            </Text>
          </View>
        )}
      </View>

      <View style={{ padding: spacing.md }}>
        <Text style={{ color: colors.textMain, fontSize: 18, fontWeight: 'bold', marginBottom: 8 }} numberOfLines={1}>
          {title}
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: 16, lineHeight: 20 }} numberOfLines={2}>
          {description}
        </Text>

        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Calendar color={colors.primary} size={16} style={{ marginRight: 8 }} />
            <Text style={{ color: colors.textMuted, fontSize: 14 }}>{formattedDate}</Text>
          </View>
          {location && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MapPin color={colors.primary} size={16} style={{ marginRight: 8 }} />
              <Text style={{ color: colors.textMuted, fontSize: 14 }} numberOfLines={1}>{location}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
