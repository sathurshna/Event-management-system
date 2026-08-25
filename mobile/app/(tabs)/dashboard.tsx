import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { globalStyles, colors } from '../../src/theme';
import { LogOut } from 'lucide-react-native';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <View style={[globalStyles.container, { padding: 24, paddingTop: 60 }]}>
      <View style={globalStyles.glassCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Text style={{ color: colors.textMain, fontSize: 24, fontWeight: 'bold' }}>Dashboard</Text>
          
          <TouchableOpacity 
            onPress={logout}
            style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.error, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}
          >
            <LogOut color="white" size={16} />
            <Text style={{ color: 'white', marginLeft: 8, fontWeight: 'bold' }}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 8 }}>
          <Text style={{ color: colors.primary, fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
            Welcome, {user?.name}!
          </Text>
          <Text style={{ color: colors.textMuted, marginBottom: 16 }}>Email: {user?.email}</Text>
          <Text style={{ color: colors.textMuted, lineHeight: 22 }}>
            You have successfully logged in to the mobile app natively using SecureStore, Expo Router, and raw MySQL!
          </Text>
        </View>
      </View>
    </View>
  );
}
