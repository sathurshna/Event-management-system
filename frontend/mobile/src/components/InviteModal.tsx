import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { Mail, X } from 'lucide-react-native';
import api from '../utils/api';
import { spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';

interface InviteModalProps {
  isVisible: boolean;
  onClose: () => void;
  eventId: string;
}

export default function InviteModal({ isVisible, onClose, eventId }: InviteModalProps) {
  const { colors, globalStyles } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [requiresConfirmation, setRequiresConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');

  const handleInvite = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await api.post(`/events/${eventId}/invites`, { email, force: requiresConfirmation });
      alert(`Invitation sent to ${email}`);
      setEmail('');
      setRequiresConfirmation(false);
      setConfirmationMessage('');
      onClose();
    } catch (error: any) {
      if (error.response?.data?.requiresConfirmation) {
        setRequiresConfirmation(true);
        setConfirmationMessage(error.response.data.message);
      } else {
        alert(error.response?.data?.message || 'Failed to send invitation');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    setRequiresConfirmation(false);
    setConfirmationMessage('');
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: spacing.lg }}>
        <View style={[globalStyles.glassCard, { backgroundColor: colors.surface, padding: spacing.xl }]}>
          <TouchableOpacity 
            onPress={onClose}
            style={{ position: 'absolute', top: spacing.md, right: spacing.md, padding: spacing.sm }}
          >
            <X color={colors.textMuted} size={24} />
          </TouchableOpacity>

          <Text style={{ color: colors.textMain, fontSize: 24, fontWeight: 'bold', marginBottom: spacing.sm }}>Invite Guest</Text>
          <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: spacing.xl }}>Send an email invitation for this event.</Text>

          <View style={{ marginBottom: spacing.lg }}>
            <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: spacing.sm }}>Guest Email</Text>
            <View style={globalStyles.inputContainer}>
              <Mail color={colors.textMuted} size={20} />
              <TextInput
                style={globalStyles.input}
                placeholder="friend@example.com"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {requiresConfirmation && (
            <View style={{ marginBottom: spacing.lg, padding: spacing.md, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 8 }}>
              <Text style={{ color: '#ef4444', fontSize: 14 }}>{confirmationMessage}</Text>
            </View>
          )}

          <TouchableOpacity 
            onPress={handleInvite} 
            disabled={loading}
            style={[globalStyles.button, requiresConfirmation ? { backgroundColor: '#ef4444' } : {}]}
          >
            {loading ? <ActivityIndicator color="white" /> : <Text style={globalStyles.buttonText}>{requiresConfirmation ? 'Yes, send again' : 'Send Invitation'}</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
