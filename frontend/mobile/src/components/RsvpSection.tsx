import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, ActivityIndicator, ScrollView } from 'react-native';
import { User } from 'lucide-react-native';
import api from '../utils/api';
import { spacing } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface Attendee {
  rsvp_id: string;
  status: 'ATTENDING' | 'MAYBE' | 'DECLINED';
  note: string | null;
  user_id: string;
  name: string;
  avatar: string | null;
}

interface RsvpSectionProps {
  eventId: string;
  isOwner?: boolean;
  hostId?: string;
}

export default function RsvpSection({ eventId, isOwner = false, hostId }: RsvpSectionProps) {
  const { user } = useAuth();
  const { colors, globalStyles } = useTheme();

  const STATUS_CONFIG = {
    ATTENDING: { label: "You're going! 🎉", color: colors.primary, bg: 'rgba(99,102,241,0.1)' },
    MAYBE:     { label: "You might go 🤔",  color: '#f59e0b',      bg: 'rgba(245,158,11,0.1)' },
    DECLINED:  { label: "Can't make it 😕", color: colors.error,   bg: 'rgba(239,68,68,0.1)' }
  };
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRsvp, setMyRsvp] = useState<Attendee | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<'ATTENDING' | 'MAYBE' | 'DECLINED'>('ATTENDING');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchAttendees = async () => {
    try {
      const res = await api.get(`/events/${eventId}/rsvps`);
      setAttendees(res.data.data);
      if (user) {
        const me = res.data.data.find((a: Attendee) => a.user_id === user.id);
        if (me) {
          setMyRsvp(me);
          setPendingStatus(me.status);
          setNote(me.note || '');
        } else {
          setMyRsvp(null);
        }
      }
    } catch (error) {
      console.log('Failed to fetch RSVPs', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendees();
  }, [eventId]);

  const handleSaveRsvp = async () => {
    setSaving(true);
    try {
      await api.post(`/events/${eventId}/rsvp`, { status: pendingStatus, note: note || null });
      setIsEditing(false);
      fetchAttendees();
    } catch (error) {
      console.log('Failed to update RSVP', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ marginTop: spacing.xl }} color={colors.primary} />;
  }

  const attending = attendees.filter(a => a.status === 'ATTENDING');
  const myConfig = myRsvp ? STATUS_CONFIG[myRsvp.status] : null;

  const statusButtons = (['ATTENDING', 'MAYBE', 'DECLINED'] as const).map(s => ({
    s,
    label: s === 'ATTENDING' ? 'Yes 🎉' : s === 'MAYBE' ? 'Maybe 🤔' : "Can't go 😔",
    activeColor: s === 'ATTENDING' ? colors.primary : s === 'MAYBE' ? '#f59e0b' : '#ef4444',
  }));

  return (
    <View style={{ marginTop: spacing.xl }}>
      {/* ── RSVP Section (hidden for host) ── */}
      {!isOwner && (
        <View style={{ marginBottom: spacing.xl }}>
          {!myRsvp && !isEditing ? (
            /* No RSVP yet */
            <>
              <Text style={{ color: colors.textMain, fontSize: 20, fontWeight: 'bold', marginBottom: spacing.md }}>
                Are you going?
              </Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {statusButtons.map(({ s, label, activeColor }) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => { setPendingStatus(s); setIsEditing(true); }}
                    style={[globalStyles.button, { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderGlass }]}
                  >
                    <Text style={{ color: colors.textMain, fontWeight: '600', fontSize: 12 }}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : !isEditing ? (
            /* Already RSVP'd */
            <>
              <Text style={{ color: colors.textMain, fontSize: 20, fontWeight: 'bold', marginBottom: spacing.md }}>
                Your Response
              </Text>
              <View style={{ padding: spacing.md, borderRadius: 12, backgroundColor: myConfig?.bg, borderWidth: 1, borderColor: `${myConfig?.color}40`, marginBottom: spacing.md }}>
                <Text style={{ color: myConfig?.color, fontWeight: '700', fontSize: 16 }}>{myConfig?.label}</Text>
                {myRsvp?.note ? (
                  <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>"{myRsvp.note}"</Text>
                ) : null}
              </View>
              <TouchableOpacity
                onPress={() => setIsEditing(true)}
                style={[globalStyles.button, { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border }]}
              >
                <Text style={{ color: colors.textMuted, fontWeight: '600' }}>Change Response</Text>
              </TouchableOpacity>
            </>
          ) : (
            /* Edit mode */
            <>
              <Text style={{ color: colors.textMain, fontSize: 20, fontWeight: 'bold', marginBottom: spacing.md }}>
                Update Your Response
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: spacing.md }}>
                {statusButtons.map(({ s, label, activeColor }) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setPendingStatus(s)}
                    style={[globalStyles.button, {
                      flex: 1,
                      backgroundColor: pendingStatus === s ? activeColor : colors.surface,
                      borderWidth: 1,
                      borderColor: pendingStatus === s ? activeColor : colors.borderGlass
                    }]}
                  >
                    <Text style={{ color: pendingStatus === s ? 'white' : colors.textMuted, fontWeight: '600', fontSize: 11 }}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder={pendingStatus !== 'ATTENDING' ? 'Add a note — e.g. "Out of town"' : 'Add a note (optional)'}
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
                style={[globalStyles.inputContainer, { height: 90, alignItems: 'flex-start', paddingTop: 12, color: colors.textMain, marginBottom: spacing.md }]}
              />

              <View style={{ flexDirection: 'row', gap: spacing.md }}>
                <TouchableOpacity onPress={handleSaveRsvp} disabled={saving} style={[globalStyles.button, { flex: 1 }]}>
                  {saving ? <ActivityIndicator color="white" size="small" /> : <Text style={globalStyles.buttonText}>Save Response</Text>}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsEditing(false)} style={[globalStyles.button, { flex: 1, backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border }]}>
                  <Text style={{ color: colors.textMuted, fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      )}

      {/* ── Attendee List ── */}
      <Text style={{ color: colors.textMain, fontSize: 20, fontWeight: 'bold', marginBottom: spacing.md }}>
        Attendees ({attending.length})
      </Text>

      {attending.length === 0 ? (
        <Text style={{ color: colors.textMuted }}>No one has RSVP'd yet. Be the first!</Text>
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {attending.map(a => (
            <View key={a.rsvp_id} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.borderGlass, padding: 12, borderRadius: 12, width: '48%', borderWidth: 1, borderColor: colors.border }}>
              {a.avatar ? (
                <Image source={{ uri: a.avatar }} style={{ width: 34, height: 34, borderRadius: 17, marginRight: 8 }} />
              ) : (
                <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', marginRight: 8 }}>
                  <User color={colors.textMuted} size={20} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textMain, fontWeight: '600', fontSize: 13 }} numberOfLines={1}>{a.name}</Text>
                {a.user_id === hostId && (
                  <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '700' }}>Host ⭐</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
