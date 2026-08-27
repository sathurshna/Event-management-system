import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Bell, MapPin, Moon, Shield, CircleHelp, Info } from 'lucide-react-native';
import { spacing } from '../src/theme';
import { useTheme } from '../src/context/ThemeContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, toggleTheme, colors, globalStyles } = useTheme();
  
  // Local state for toggles
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(true);

  const renderSettingRow = (icon: any, title: string, value: boolean, onValueChange: (val: boolean) => void) => (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surfaceSecondary,
      padding: 16,
      borderRadius: 16,
      marginBottom: 12
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {icon}
        <Text style={{ color: colors.textMain, fontSize: 16, fontWeight: '600', marginLeft: 16 }}>{title}</Text>
      </View>
      <Switch 
        value={value} 
        onValueChange={onValueChange} 
        trackColor={{ false: colors.surface, true: colors.primary }}
        thumbColor={value ? '#fff' : '#f4f3f4'}
      />
    </View>
  );

  return (
    <View style={[globalStyles.container, { paddingTop: 60 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xl, paddingHorizontal: spacing.lg }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <ChevronLeft color={colors.textMain} size={28} />
        </TouchableOpacity>
        <Text style={{ color: colors.textMain, fontSize: 24, fontWeight: 'bold' }}>Settings</Text>
      </View>
      
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 100 }}>
        
        <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: '700', letterSpacing: 1, marginBottom: 12, marginLeft: 4, marginTop: 8 }}>
          NOTIFICATIONS
        </Text>
        {renderSettingRow(<Bell color={colors.textMain} size={22} />, 'Push Notifications', pushEnabled, setPushEnabled)}
        {renderSettingRow(<Bell color={colors.textMain} size={22} opacity={0.6} />, 'Email Alerts', emailEnabled, setEmailEnabled)}

        <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: '700', letterSpacing: 1, marginBottom: 12, marginLeft: 4, marginTop: 24 }}>
          PREFERENCES
        </Text>
        {renderSettingRow(<MapPin color={colors.textMain} size={22} />, 'Location Services', locationEnabled, setLocationEnabled)}
        {renderSettingRow(<Moon color={colors.textMain} size={22} />, 'Dark Mode', theme === 'dark', toggleTheme)}

        <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: '700', letterSpacing: 1, marginBottom: 12, marginLeft: 4, marginTop: 24 }}>
          ABOUT
        </Text>
        <TouchableOpacity 
          onPress={() => Alert.alert('Privacy Policy', 'Your privacy is important to us. This policy will be available soon.')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.surfaceSecondary,
            padding: 16,
            borderRadius: 16,
            marginBottom: 12
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Shield color={colors.textMain} size={22} />
            <Text style={{ color: colors.textMain, fontSize: 16, fontWeight: '600', marginLeft: 16 }}>Privacy Policy</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => Alert.alert('Help & Support', 'Support resources will be available in a future update.')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.surfaceSecondary,
            padding: 16,
            borderRadius: 16,
            marginBottom: 12
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <CircleHelp color={colors.textMain} size={22} />
            <Text style={{ color: colors.textMain, fontSize: 16, fontWeight: '600', marginLeft: 16 }}>Help & Support</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => Alert.alert('App Version', 'You are currently running version 1.0.0 (Build 42)')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.surfaceSecondary,
            padding: 16,
            borderRadius: 16,
            marginBottom: 12
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Info color={colors.textMain} size={22} />
            <Text style={{ color: colors.textMain, fontSize: 16, fontWeight: '600', marginLeft: 16 }}>App Version</Text>
          </View>
          <Text style={{ color: colors.textMuted, fontSize: 14 }}>1.0.0</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}
