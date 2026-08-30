import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, Modal, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import { ChevronDown, ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';
import api from '../../src/utils/api';
import { spacing, borderRadius } from '../../src/theme';

interface EventData {
  id: string;
  title: string;
  date: string;
  end_date?: string;
  is_public: boolean;
  host_id: string;
  location?: string;
}

const getEventColor = (event: EventData, colors: any) => {
  const eventDate = new Date(event.date);
  const now = new Date();
  
  if (eventDate < now) return '#9ca3af'; // Gray for past
  if (event.is_public) return '#facc15'; // Yellow for public
  return '#e879f9'; // Pink/Magenta for private
};

const toDateString = (date: Date | string) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const CustomDay = ({ date, state, marking, onPress, colors }: any) => {
  const isSelected = marking?.selected;
  const isToday = state === 'today';
  const dots = marking?.dots || [];

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress && onPress(date)}
      style={{
        width: 38,
        height: 38,
        padding: 4,
        backgroundColor: isSelected ? colors.surfaceSecondary : 'transparent',
        borderRadius: 19, // Circular indicator
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Pills positioned on the left side of the cell */}
      {dots.length > 0 && (
        <View style={{ position: 'absolute', left: 4, flexDirection: 'row', gap: 2 }}>
          {dots.slice(0, 2).map((dot: any, index: number) => (
            <View 
              key={index} 
              style={{ 
                width: 3, 
                height: 12, 
                borderRadius: 1.5, 
                backgroundColor: dot.color // Keep original color always
              }} 
            />
          ))}
        </View>
      )}
      
      {/* Date Text */}
      <Text style={{
        color: isSelected ? colors.primary : (isToday ? colors.textMain : colors.textMain),
        fontWeight: isSelected || isToday ? 'bold' : 'normal',
        fontSize: 15,
      }}>
        {date?.day}
      </Text>
    </TouchableOpacity>
  );
};

import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

import { useTheme } from '../../src/context/ThemeContext';

export default function CalendarScreen() {
  const { colors, theme, globalStyles } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(toDateString(new Date()));
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showYearPicker, setShowYearPicker] = useState(false);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchEvents = async () => {
        try {
          const response = await api.get('/events?limit=1000&category=calendar');
          if (isActive) {
            setEvents(response.data.data);
          }
        } catch (err: any) {
          if (isActive) {
            setError(err.message || 'Failed to fetch events');
          }
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      };
      
      fetchEvents();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const markedDates = useMemo(() => {
    const marks: any = {};

    // First add dots for all events
    events.forEach(event => {
      const dateStr = toDateString(event.date);
      if (!marks[dateStr]) {
        marks[dateStr] = { dots: [] };
      }
      if (marks[dateStr].dots.length < 3) {
        marks[dateStr].dots.push({ key: event.id, color: getEventColor(event, colors) });
      }
    });

    // Apply bright white selection for the user-selected date
    if (selectedDate) {
      if (!marks[selectedDate]) marks[selectedDate] = {};
      marks[selectedDate] = { 
        ...marks[selectedDate], 
        selected: true, 
      };
    }

    return marks;
  }, [events, selectedDate]);

  const selectedEvents = events.filter(e => toDateString(e.date) === selectedDate);

  const handleToday = () => {
    const today = new Date();
    setSelectedDate(toDateString(today));
    setCurrentMonth(today);
  };

  const handleYearSelect = (year: number) => {
    const newDate = new Date(currentMonth);
    newDate.setFullYear(year);
    setCurrentMonth(newDate);
    // Auto-select the 1st of the month in the new year
    setSelectedDate(toDateString(new Date(year, newDate.getMonth(), 1)));
    setShowYearPicker(false);
  };

  const addMonths = (date: Date, months: number) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  };

  const changeMonth = (monthsToAdd: number) => {
    const next = addMonths(currentMonth, monthsToAdd);
    setCurrentMonth(next);
    // Auto-select the 1st of the newly viewed month so the bottom sheet updates
    setSelectedDate(toDateString(new Date(next.getFullYear(), next.getMonth(), 1)));
  };

  const renderEvent = ({ item }: { item: EventData }) => {
    const color = getEventColor(item, colors);
    const eventTime = new Date(item.date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    
    return (
      <View style={styles.timelineRow}>
        {/* Left Side: Time */}
        <View style={styles.timelineTimeColumn}>
          <Text style={styles.timelineTimeText}>{eventTime}</Text>
        </View>
        
        {/* Right Side: Details */}
        <View style={styles.timelineDetailColumn}>
          <TouchableOpacity onPress={() => router.push(`/(tabs)/event/${item.id}`)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <View style={[styles.timelineDot, { backgroundColor: color }]} />
              <Text style={styles.timelineTitle}>{item.title}</Text>
            </View>
            {item.location && (
              <Text style={styles.timelineLocation}>{item.location}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[globalStyles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Generate a list of years for the picker
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  return (
    <View style={globalStyles.container}>
      
      {/* Top Header Section */}
      <View style={styles.topHeader}>
        <View style={styles.topHeaderRow}>
          <TouchableOpacity 
            style={{ flexDirection: 'row', alignItems: 'center' }} 
            onPress={() => setShowYearPicker(true)}
          >
            <Text style={styles.yearText}>{currentMonth.getFullYear()}</Text>
            <ChevronDown size={18} color={colors.textMuted} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
            <TouchableOpacity onPress={handleToday}>
              <Text style={styles.todayButtonText}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push({ pathname: '/(tabs)/create', params: { date: selectedDate } })}>
              <Plus size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
          <Text style={styles.monthText}>
            {currentMonth.toLocaleDateString('en-US', { month: 'long' })}
          </Text>
          <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center', paddingRight: spacing.sm }}>
            <TouchableOpacity onPress={() => changeMonth(-1)} style={{ padding: 4 }}>
              <ChevronLeft size={28} color={colors.textMain} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => changeMonth(1)} style={{ padding: 4 }}>
              <ChevronRight size={28} color={colors.textMain} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Year Picker Modal */}
      <Modal visible={showYearPicker} transparent={true} animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowYearPicker(false)}>
          <View style={styles.yearPickerContainer}>
            <Text style={styles.yearPickerTitle}>Select Year</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {years.map(year => (
                <TouchableOpacity 
                  key={year} 
                  style={[styles.yearItem, currentMonth.getFullYear() === year && styles.yearItemSelected]}
                  onPress={() => handleYearSelect(year)}
                >
                  <Text style={[styles.yearItemText, currentMonth.getFullYear() === year && styles.yearItemTextSelected]}>
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Calendar Component */}
      <Calendar
        current={currentMonth.toISOString().split('T')[0]}
        key={currentMonth.toISOString() + theme} 
        onDayPress={(day: any) => setSelectedDate(day.dateString)}
        markedDates={markedDates}
        enableSwipeMonths={true}
        hideArrows={true}
        dayComponent={(props: any) => <CustomDay {...props} colors={colors} />}
        onMonthChange={(month: any) => {
          const newMonth = new Date(month.timestamp);
          setCurrentMonth(newMonth);
          setSelectedDate(toDateString(new Date(newMonth.getFullYear(), newMonth.getMonth(), 1)));
        }}
        renderHeader={() => null} // Hide default header completely
        theme={{
          backgroundColor: colors.background,
          calendarBackground: colors.background, // Flat against app background
          textSectionTitleColor: colors.textMuted,
          monthTextColor: colors.textMain,
          textDayHeaderFontWeight: 'bold',
        }}
      />

      {/* Bottom Sheet Events List */}
      <View style={styles.bottomSheet}>
        {/* Drag handle */}
        <View style={styles.dragHandle} />
        
        {/* Sheet Header */}
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetDateText}>
            {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
        </View>
        
        {error ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.error }]}>{error}</Text>
          </View>
        ) : (
          <FlatList
            data={selectedEvents}
            keyExtractor={item => item.id}
            renderItem={renderEvent}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No events on this day</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  topHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.background,
  },
  topHeaderRow: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
  },
  yearText: {
    color: colors.textMuted,
    fontSize: 18,
    fontWeight: 'bold',
  },
  monthText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.textMain,
    marginTop: 10,
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 12,
    marginTop: 10,
    shadowColor: colors.overlayMedium,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetHeader: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sheetDateText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: 'bold',
  },
  todayButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  yearPickerContainer: {
    width: 250,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  yearPickerTitle: {
    color: colors.textMain,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  yearItem: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
  },
  yearItemSelected: {
    backgroundColor: colors.overlayLight,
  },
  yearItemText: {
    color: colors.textMain,
    fontSize: 16,
  },
  yearItemTextSelected: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  timelineRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.overlayLight,
  },
  timelineTimeColumn: {
    width: 85,
  },
  timelineTimeText: {
    color: colors.textMain,
    fontWeight: 'bold',
    fontSize: 13,
  },
  timeColumn: {
    width: 60,
    alignItems: 'center',
    paddingVertical: 20,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  timelineDetailColumn: {
    flex: 1,
    paddingLeft: spacing.md,
    borderLeftWidth: 1,
    borderLeftColor: colors.overlayMedium,
  },
  timelineDot: {
    width: 4,
    height: 14,
    borderRadius: 2,
    marginRight: 8,
  },
  timelineTitle: {
    color: colors.textMain,
    fontSize: 15,
    fontWeight: 'bold',
  },
  timelineLocation: {
    color: colors.textMuted,
    fontSize: 12,
    marginLeft: 14,
  },
  emptyContainer: {
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
  }
});
