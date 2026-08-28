import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch, ActivityIndicator, Alert, Platform, Image } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Camera, X } from 'lucide-react-native';
import { spacing, borderRadius } from '../../../src/theme';
import { useTheme } from '../../../src/context/ThemeContext';
import api from '../../../src/utils/api';

export default function EditEventMobile() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors, globalStyles } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date(),
    location: '',
    isPublic: false,
    coverImage: '' as string | null,
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(`/events/${id}`);
        const event = response.data.data;
        setFormData({
          title: event.title,
          description: event.description || '',
          date: new Date(event.date),
          location: event.location,
          isPublic: event.is_public === 1 || event.is_public === true,
          coverImage: event.cover_image || null,
        });
      } catch (error) {
        console.log('Failed to fetch event', error);
        Alert.alert('Error', 'Failed to load event details.');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photo library to set a cover image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      // Use base64 data URI if available, otherwise use URI
      const imageData = asset.base64
        ? `data:image/jpeg;base64,${asset.base64}`
        : asset.uri;
      handleChange('coverImage', imageData);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.date || !formData.location) {
      Alert.alert('Validation Error', 'Please fill in all required fields (Title, Date, Location).');
      return;
    }

    setSaving(true);
    try {
      await api.put(`/events/${id}`, {
        title: formData.title,
        description: formData.description,
        date: formData.date.toISOString(),
        location: formData.location,
        isPublic: formData.isPublic,
        coverImage: formData.coverImage,
      });

      Alert.alert('Success', 'Event updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.log(error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update event.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingTop: 60, paddingBottom: 40 }}>
        <Text style={{ color: colors.textMain, fontSize: 28, fontWeight: 'bold', marginBottom: spacing.sm }}>Edit Event</Text>
        <Text style={{ color: colors.textMuted, marginBottom: spacing.xl }}>Update the details of your event.</Text>

        {/* Cover Image Picker */}
        <View style={{ marginBottom: spacing.xl }}>
          <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: spacing.sm }}>Cover Image</Text>
          <TouchableOpacity
            onPress={handlePickImage}
            style={{
              height: 180,
              borderRadius: borderRadius.lg,
              borderRadius: borderRadius.md,
              borderWidth: 2,
              borderColor: colors.border,
              borderStyle: 'dashed',
              overflow: 'hidden',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: colors.surface,
            }}
          >
            {formData.coverImage ? (
              <>
                <Image
                  source={{ uri: formData.coverImage }}
                  style={{ width: '100%', height: '100%', position: 'absolute' }}
                  resizeMode="cover"
                />
                {/* Overlay edit hint */}
                <View style={{ backgroundColor: colors.surfaceSecondary, padding: 10, borderRadius: borderRadius.md, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Camera color="white" size={18} />
                  <Text style={{ color: 'white', fontWeight: '600' }}>Change Image</Text>
                </View>
                {/* Remove button */}
                <TouchableOpacity
                  onPress={() => handleChange('coverImage', null)}
                  style={{ position: 'absolute', top: 10, right: 10, backgroundColor: colors.surfaceSecondary, padding: 6, borderRadius: 100 }}
                >
                  <X color="white" size={16} />
                </TouchableOpacity>
              </>
            ) : (
              <View style={{ alignItems: 'center', gap: 8 }}>
                <View style={{ backgroundColor: colors.surfaceSecondary, padding: 16, borderRadius: 100 }}>
                  <Camera color={colors.primary} size={28} />
                </View>
                <Text style={{ color: colors.textMuted, fontSize: 14 }}>Tap to select a cover photo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={globalStyles.glassCard}>
          <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: spacing.sm }}>Event Title *</Text>
          <TextInput
            style={[globalStyles.inputContainer, { color: colors.textMain }]}
            placeholder="E.g. Summer BBQ"
            placeholderTextColor={colors.textMuted}
            value={formData.title}
            onChangeText={t => handleChange('title', t)}
          />

          <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: spacing.sm }}>Description</Text>
          <TextInput
            style={[globalStyles.inputContainer, { height: 100, alignItems: 'flex-start', paddingTop: 12, paddingBottom: 12, color: colors.textMain }]}
            placeholder="Tell your guests what it's about..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            value={formData.description}
            onChangeText={t => handleChange('description', t)}
          />

          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: spacing.sm }}>Date *</Text>
              <TouchableOpacity
                style={globalStyles.inputContainer}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{ color: colors.textMain }}>{formData.date.toLocaleDateString()}</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: spacing.sm }}>Time *</Text>
              <TouchableOpacity
                style={globalStyles.inputContainer}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={{ color: colors.textMain }}>{formData.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={formData.date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  // Preserve existing time, only change the date
                  const merged = new Date(formData.date);
                  merged.setFullYear(selectedDate.getFullYear());
                  merged.setMonth(selectedDate.getMonth());
                  merged.setDate(selectedDate.getDate());
                  handleChange('date', merged);
                }
              }}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={formData.date}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowTimePicker(false);
                if (selectedDate) {
                  // Preserve existing date, only change the time
                  const merged = new Date(formData.date);
                  merged.setHours(selectedDate.getHours());
                  merged.setMinutes(selectedDate.getMinutes());
                  merged.setSeconds(0);
                  handleChange('date', merged);
                }
              }}
            />
          )}

          <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: spacing.sm }}>Location *</Text>
          <TextInput
            style={[globalStyles.inputContainer, { color: colors.textMain }]}
            placeholder="E.g. 123 Main St"
            placeholderTextColor={colors.textMuted}
            value={formData.location}
            onChangeText={t => handleChange('location', t)}
          />

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.md, paddingVertical: spacing.sm }}>
            <View>
              <Text style={{ color: colors.textMain, fontWeight: 'bold' }}>Public Event</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>Anyone can see and attend this event.</Text>
            </View>
            <Switch
              value={formData.isPublic}
              onValueChange={v => handleChange('isPublic', v)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="white"
            />
          </View>

          <TouchableOpacity 
            onPress={handleSave} 
            disabled={saving}
            style={[globalStyles.button, { marginTop: spacing.xl }]}
          >
            {saving ? <ActivityIndicator color="white" /> : <Text style={globalStyles.buttonText}>Save Changes</Text>}
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => router.back()}
            disabled={saving}
            style={[globalStyles.button, { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border, marginTop: spacing.md }]}
          >
            <Text style={{ color: colors.textMuted, fontWeight: 'bold' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
