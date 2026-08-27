import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch, ActivityIndicator, Alert, Platform, Image } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Camera, X } from 'lucide-react-native';
import { globalStyles, colors, spacing, borderRadius } from '../../src/theme';
import api from '../../src/utils/api';

export default function CreateEventMobile() {
  const router = useRouter();
  const { date } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  
  // Parse date param if provided safely to avoid timezone offset issues
  let initialDate = new Date();
  if (date && typeof date === 'string') {
    const parts = date.split('-');
    if (parts.length === 3) {
      initialDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }
  }

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: initialDate,
    location: '',
    isPublic: false,
    coverImage: null as string | null,
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

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
      const imageData = asset.base64
        ? `data:image/jpeg;base64,${asset.base64}`
        : asset.uri;
      handleChange('coverImage', imageData);
    }
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.date || !formData.location) {
      Alert.alert('Validation Error', 'Please fill in all required fields (Title, Date, Location).');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/events', {
        title: formData.title,
        description: formData.description,
        date: formData.date.toISOString(),
        location: formData.location,
        isPublic: formData.isPublic,
        coverImage: formData.coverImage,
      });

      Alert.alert('Success', 'Event created successfully!', [
        { text: 'OK', onPress: () => router.replace(`/(tabs)/event/${response.data.data.id}`) }
      ]);
      
      // Reset form
      setFormData({ title: '', description: '', date: new Date(), location: '', isPublic: false, coverImage: null });
    } catch (error: any) {
      console.log(error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[globalStyles.container, { paddingTop: 60 }]}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }}>
        <Text style={{ color: colors.textMain, fontSize: 28, fontWeight: 'bold', marginBottom: spacing.sm }}>Create Event</Text>
        <Text style={{ color: colors.textMuted, marginBottom: spacing.xl }}>Host a new gathering, party, or meeting.</Text>

        {/* Cover Image Picker */}
        <View style={{ marginBottom: spacing.xl }}>
          <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: spacing.sm }}>Cover Image</Text>
          <TouchableOpacity
            onPress={handlePickImage}
            style={{
              height: 180,
              borderRadius: borderRadius.lg,
              borderWidth: 2,
              borderColor: colors.border,
              borderStyle: 'dashed',
              overflow: 'hidden',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.02)',
            }}
          >
            {formData.coverImage ? (
              <>
                <Image
                  source={{ uri: formData.coverImage }}
                  style={{ width: '100%', height: '100%', position: 'absolute' }}
                  resizeMode="cover"
                />
                <View style={{ backgroundColor: 'rgba(0,0,0,0.4)', padding: 10, borderRadius: borderRadius.md, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Camera color="white" size={18} />
                  <Text style={{ color: 'white', fontWeight: '600' }}>Change Image</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleChange('coverImage', null)}
                  style={{ position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', padding: 6, borderRadius: 100 }}
                >
                  <X color="white" size={16} />
                </TouchableOpacity>
              </>
            ) : (
              <View style={{ alignItems: 'center', gap: 8 }}>
                <View style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: 16, borderRadius: 100 }}>
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
            onPress={handleCreate} 
            disabled={loading}
            style={[globalStyles.button, { marginTop: spacing.xl }]}
          >
            {loading ? <ActivityIndicator color="white" /> : <Text style={globalStyles.buttonText}>Create Event</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
