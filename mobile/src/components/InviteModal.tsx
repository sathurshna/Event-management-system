import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { Mail, X } from 'lucide-react-native';
import api from '../utils/api';
import { globalStyles, colors, spacing } from '../theme';

interface InviteModalProps {
  isVisible: boolean;
  onClose: () => void;
  eventId: string;
}

export default function InviteModal({ isVisible, onClose, eventId }: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await api.post(`/events/${eventId}/invites`, { email });
      // In a real app we'd use Toast or Alert
      alert(`Invitation sent to ${email}`);
      setEmail('');
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
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
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <TouchableOpacity 
            onPress={handleInvite} 
            disabled={loading}
            style={globalStyles.button}
          >
            {loading ? <ActivityIndicator color="white" /> : <Text style={globalStyles.buttonText}>Send Invitation</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
