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
      <View style={globalStyles.glassCard}>
        <Text style={{ color: colors.textMain, fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 }}>
          Welcome Back
        </Text>

        {error ? <Text style={{ color: colors.error, marginBottom: 12, textAlign: 'center' }}>{error}</Text> : null}

        <View style={globalStyles.inputContainer}>
          <Mail color={colors.textMuted} size={20} />
          <TextInput
            style={globalStyles.input}
            placeholder="Email Address"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={globalStyles.inputContainer}>
          <Lock color={colors.textMuted} size={20} />
          <TextInput
            style={globalStyles.input}
            placeholder="Password"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          style={[globalStyles.button, loading && { opacity: 0.7 }]} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <LogIn color="white" size={20} />
              <Text style={globalStyles.buttonText}>Sign In</Text>
            </>
          )}
        </TouchableOpacity>

        <Link href="/(auth)/register" style={{ marginTop: 24, textAlign: 'center' }}>
          <Text style={{ color: colors.textMuted }}>Don't have an account? </Text>
          <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Create one here</Text>
        </Link>
      </View>
    </View>
  );
}
