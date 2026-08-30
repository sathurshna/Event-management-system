import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, User, Mail, Save } from 'lucide-react-native';
import { spacing } from '../src/theme';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const { colors, globalStyles } = useTheme();
  
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState<string | null>(user?.avatar || null);
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.2, // heavily compress
      base64: true, // get base64 string
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setAvatar(base64Image);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty.');
      return;
    }

    try {
      setSaving(true);
      await updateUser({ name: name.trim(), avatar: avatar || undefined });
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.log('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[globalStyles.container, { flex: 1 }]}
    >
      <View style={{ paddingTop: 60, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xl }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <ChevronLeft color={colors.textMain} size={28} />
        </TouchableOpacity>
        <Text style={{ color: colors.textMain, fontSize: 24, fontWeight: 'bold' }}>Edit Profile</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg }}>
        
        {/* Avatar Placeholder */}
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <View style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: colors.surfaceSecondary,
            borderWidth: 2,
            borderColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden'
          }}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={{ width: '100%', height: '100%' }} />
            ) : (
              <Text style={{ color: colors.textMain, fontSize: 36, fontWeight: 'bold' }}>
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </Text>
            )}
          </View>
          <TouchableOpacity onPress={pickImage}>
            <Text style={{ color: colors.primary, marginTop: 12, fontWeight: '600' }}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Input Fields */}
        <View style={{ marginBottom: spacing.xl }}>
          <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: 8, fontWeight: '600', marginLeft: 4 }}>
            DISPLAY NAME
          </Text>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surfaceSecondary,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 16,
            height: 56
          }}>
            <User color={colors.textMuted} size={20} style={{ marginRight: 12 }} />
            <TextInput
              style={{ flex: 1, color: colors.textMain, fontSize: 16 }}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>

        <View style={{ marginBottom: spacing.xl }}>
          <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: 8, fontWeight: '600', marginLeft: 4 }}>
            EMAIL ADDRESS
          </Text>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.overlaySubtle,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.overlayLight,
            paddingHorizontal: 16,
            height: 56
          }}>
            <Mail color={colors.textMuted} size={20} style={{ marginRight: 12, opacity: 0.5 }} />
            <TextInput
              style={{ flex: 1, color: colors.textMuted, fontSize: 16, opacity: 0.5 }}
              value={user?.email || ''}
              editable={false}
            />
          </View>
          <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 8, marginLeft: 4 }}>
            Email cannot be changed directly at this time.
          </Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving || !name.trim() || (name === user?.name && avatar === (user?.avatar || null))}
          style={{
            backgroundColor: (saving || !name.trim() || (name === user?.name && avatar === (user?.avatar || null))) ? colors.surfaceSecondary : colors.primary,
            height: 56,
            borderRadius: 28,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 20
          }}
        >
          {saving ? (
            <ActivityIndicator color={colors.textMain} />
          ) : (
            <>
              <Save color={(saving || !name.trim() || name === user?.name) ? colors.textMuted : colors.textMain} size={20} style={{ marginRight: 8 }} />
              <Text style={{ 
                color: (saving || !name.trim() || name === user?.name) ? colors.textMuted : colors.textMain, 
                fontSize: 16, 
                fontWeight: 'bold' 
              }}>
                Save Changes
              </Text>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
