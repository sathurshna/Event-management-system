import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '../../src/utils/api';
import { globalStyles, colors, spacing, borderRadius } from '../../src/theme';

export default function InviteAcceptMobile() {
  const { token } = useLocalSearchParams();
  const router = useRouter();
  const [invite, setInvite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        const response = await api.get(`/invites/${token}`);
        setInvite(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Invalid or expired invitation');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchInvite();
  }, [token]);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await api.post(`/invites/${token}/accept`, { note });
      // Redirect to the event details or dashboard
      router.replace(`/(tabs)/event/${invite.event_id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to accept invitation');
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    setDeclining(true);
    try {
      await api.post(`/invites/${token}/decline`, { note });
      router.replace('/(tabs)/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to decline invitation');
    } finally {
      setDeclining(false);
    }
  };

  if (loading) {
    return (
      <View style={[globalStyles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[globalStyles.container, { justifyContent: 'center', padding: spacing.xl }]}>
        <Text style={{ color: colors.error, fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>Oops!</Text>
        <Text style={{ color: colors.textMuted, fontSize: 16, textAlign: 'center', marginBottom: 24 }}>{error}</Text>
        <TouchableOpacity onPress={() => router.back()} style={globalStyles.button}>
          <Text style={globalStyles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (invite?.accepted || invite?.declined) {
    return (
      <View style={[globalStyles.container, { justifyContent: 'center', padding: spacing.xl }]}>
        <Text style={{ color: colors.textMain, fontSize: 20, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' }}>
          You've already responded to this invitation!
        </Text>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/dashboard')} style={globalStyles.button}>
          <Text style={globalStyles.buttonText}>Go Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[globalStyles.container, { justifyContent: 'center', padding: spacing.xl }]}>
      <View style={[globalStyles.glassCard, { padding: spacing.xl }]}>
        <View style={{ width: 64, height: 64, backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: 32, alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginBottom: spacing.lg }}>
          <Text style={{ fontSize: 32 }}>🎉</Text>
        </View>
        
        <Text style={{ color: colors.textMain, fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>
          You're Invited!
        </Text>
        <Text style={{ color: colors.textMuted, textAlign: 'center', marginBottom: 24, lineHeight: 22 }}>
          <Text style={{ fontWeight: 'bold', color: colors.textMain }}>{invite.inviter_name}</Text> has invited you to attend <Text style={{ fontWeight: 'bold', color: colors.textMain }}>{invite.title}</Text>.
        </Text>

        <View style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: borderRadius.md, marginBottom: 24 }}>
          <Text style={{ color: colors.textMain, marginBottom: 4 }}><Text style={{ color: colors.textMuted }}>Date:</Text> {new Date(invite.date).toLocaleDateString()}</Text>
          <Text style={{ color: colors.textMain }}><Text style={{ color: colors.textMuted }}>Location:</Text> {invite.location}</Text>
        </View>

        <Text style={{ color: colors.textMuted, marginBottom: 8, fontSize: 14 }}>Add a note to the host (Optional)</Text>
        <TextInput
          style={[globalStyles.inputContainer, { height: 80, alignItems: 'flex-start', paddingTop: 12, paddingBottom: 12, color: colors.textMain }]}
          multiline
          numberOfLines={3}
          value={note}
          onChangeText={setNote}
          placeholder="E.g. Thanks for the invite! I'll be there."
          placeholderTextColor={colors.textMuted}
        />

        <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
          <TouchableOpacity 
            onPress={handleDecline} 
            disabled={accepting || declining} 
            style={{ 
              flex: 1, 
              backgroundColor: 'rgba(239, 68, 68, 0.1)', 
              borderColor: 'rgba(239, 68, 68, 0.2)', 
              borderWidth: 1, 
              padding: 14, 
              borderRadius: borderRadius.md,
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Text style={{ color: colors.error, fontWeight: 'bold' }}>{declining ? 'Declining...' : 'Decline'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleAccept} 
            disabled={accepting || declining} 
            style={[globalStyles.button, { flex: 1, marginTop: 0 }]}
          >
            <Text style={globalStyles.buttonText}>{accepting ? 'Accepting...' : 'Accept'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
