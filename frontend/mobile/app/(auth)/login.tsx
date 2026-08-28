import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { Mail, Lock, LogIn } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import api from '../../src/utils/api';
import { useTheme } from '../../src/context/ThemeContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { colors, globalStyles } = useTheme();

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      await login(response.data.accessToken);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[globalStyles.container, { justifyContent: 'center' }]}>
      
      {/* Background glow effect simulation */}
      <View style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: colors.primary, opacity: 0.15, transform: [{ scale: 2 }] }} />
      <View style={{ position: 'absolute', bottom: -50, left: -50, width: 250, height: 250, borderRadius: 125, backgroundColor: colors.secondary || colors.primary, opacity: 0.1, transform: [{ scale: 2 }] }} />

      <View style={[globalStyles.glassCard, { borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, elevation: 10, shadowColor: colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20 }]}>
        
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 12 }}>
            <LogIn color="white" size={32} />
          </View>
          <Text style={{ color: colors.textMain, fontSize: 28, fontWeight: '900', textAlign: 'center', letterSpacing: -0.5 }}>
            Welcome Back
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 15, marginTop: 8, textAlign: 'center' }}>
            Sign in to continue to your dashboard
          </Text>
        </View>

        {error ? <Text style={{ color: colors.error, marginBottom: 16, textAlign: 'center', fontWeight: '500' }}>{error}</Text> : null}

        <View style={[globalStyles.inputContainer, { backgroundColor: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.05)', borderWidth: 1 }]}>
          <Mail color={colors.textMuted} size={20} />
          <TextInput
            style={[globalStyles.input, { color: colors.textMain }]}
            placeholder="Email Address"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={[globalStyles.inputContainer, { backgroundColor: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.05)', borderWidth: 1, marginTop: 16 }]}>
          <Lock color={colors.textMuted} size={20} />
          <TextInput
            style={[globalStyles.input, { color: colors.textMain }]}
            placeholder="Password"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          style={[globalStyles.button, { marginTop: 24, height: 56, shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10 }, loading && { opacity: 0.7 }]} 
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text style={[globalStyles.buttonText, { fontSize: 18, fontWeight: 'bold' }]}>Sign In</Text>
            </>
          )}
        </TouchableOpacity>

        <Link href="/(auth)/register" style={{ marginTop: 32, textAlign: 'center' }}>
          <Text style={{ color: colors.textMuted, fontSize: 15 }}>Don't have an account? </Text>
          <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 15 }}>Create one here</Text>
        </Link>
      </View>
    </View>
  );
}
