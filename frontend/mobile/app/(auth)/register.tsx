import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Mail, Lock, UserPlus, User } from 'lucide-react-native';
import api from '../../src/utils/api';
import { useTheme } from '../../src/context/ThemeContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { colors, globalStyles } = useTheme();

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register', { name, email, password });
      // Redirect to login after successful registration
      router.replace('/(auth)/login');
    } catch (err: any) {
      if (err.response?.data?.errors) {
        // Just take the first validation error message for simplicity on mobile
        setError(err.response.data.errors[0].message);
      } else {
        setError(err.response?.data?.message || 'Failed to register');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[globalStyles.container, { justifyContent: 'center' }]}>
      <View style={globalStyles.glassCard}>
        <Text style={{ color: colors.textMain, fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 }}>
          Create Account
        </Text>

        {error ? <Text style={{ color: colors.error, marginBottom: 12, textAlign: 'center' }}>{error}</Text> : null}

        <View style={globalStyles.inputContainer}>
          <User color={colors.textMuted} size={20} />
          <TextInput
            style={globalStyles.input}
            placeholder="Full Name"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>

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
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <UserPlus color="white" size={20} />
              <Text style={globalStyles.buttonText}>Sign Up</Text>
            </>
          )}
        </TouchableOpacity>

        <Link href="/(auth)/login" style={{ marginTop: 24, textAlign: 'center' }}>
          <Text style={{ color: colors.textMuted }}>Already have an account? </Text>
          <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Log in here</Text>
        </Link>
      </View>
    </View>
  );
}
