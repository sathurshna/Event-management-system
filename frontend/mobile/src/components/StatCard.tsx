import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { ChevronRight } from 'lucide-react-native';

interface StatCardProps {
  title: string;
  value: string | number;
  trendText?: string;
  trendType?: 'positive' | 'link' | 'neutral';
  onTrendPress?: () => void;
  Icon: React.ElementType;
  accentColor: string;
  accentBg: string;
  sparklineData: number[];
  isLast?: boolean;
  cardWidth?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  trendText,
  trendType = 'positive',
  onTrendPress,
  Icon,
  accentColor,
  accentBg,
  sparklineData,
  isLast,
  cardWidth = SCREEN_WIDTH * 0.45,
}) => {
  const generatePath = (data: number[], width: number, height: number) => {
    if (!data || data.length === 0) return '';
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    const normalizedData = data.map(d => (d - min) / range);
    const stepX = width / (data.length - 1);
    
    let path = `M 0 ${height - normalizedData[0] * height}`;
    
    for (let i = 0; i < data.length - 1; i++) {
      const x1 = i * stepX;
      const y1 = height - normalizedData[i] * height;
      const x2 = (i + 1) * stepX;
      const y2 = height - normalizedData[i + 1] * height;
      
      const cx1 = x1 + stepX / 2;
      const cy1 = y1;
      const cx2 = x1 + stepX / 2;
      const cy2 = y2;
      
      path += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
    }
    
    return path;
  };

  const sparklineWidth = cardWidth * 0.7;
  const sparklineHeight = 50;
  const path = generatePath(sparklineData, sparklineWidth, sparklineHeight);

  return (
    <View style={[styles.card, { width: cardWidth }]}>
      <View style={styles.sparklineContainer}>
        <Svg width={sparklineWidth} height={sparklineHeight} viewBox={`0 0 ${sparklineWidth} ${sparklineHeight}`}>
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={accentColor} stopOpacity="0.0" />
              <Stop offset="1" stopColor={accentColor} stopOpacity="1" />
            </LinearGradient>
          </Defs>
          
          {/* Glow layers */}
          <Path d={path} fill="none" stroke="url(#grad)" strokeWidth="12" strokeOpacity="0.1" strokeLinecap="round" strokeLinejoin="round" />
          <Path d={path} fill="none" stroke="url(#grad)" strokeWidth="6" strokeOpacity="0.3" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Main stroke */}
          <Path d={path} fill="none" stroke="url(#grad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </View>

      <View style={styles.topRow}>
        <View style={[styles.iconBox, { backgroundColor: accentBg }]}>
          <Icon color={accentColor} size={18} strokeWidth={2.5} />
        </View>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        
        {isLast && (
          <TouchableOpacity onPress={onTrendPress} style={styles.viewAllButton}>
            <Text style={[styles.viewAllText, { color: accentColor }]}>View all</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.value}>{value}</Text>

        {trendText && (
          <View style={styles.footer}>
            {trendType === 'link' ? (
              <TouchableOpacity onPress={onTrendPress} style={styles.trendLinkBox}>
                <Text style={[styles.trendText, { color: accentColor }]}>{trendText}</Text>
                <ChevronRight color={accentColor} size={14} style={{ marginLeft: 2, marginTop: 1 }} />
              </TouchableOpacity>
            ) : (
              <Text style={[styles.trendText, { color: trendType === 'positive' ? '#22c55e' : '#94a3b8' }]}>
                {trendText}
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    height: 135,
    backgroundColor: '#12141c',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    zIndex: 10,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  title: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  viewAllButton: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    zIndex: 10,
  },
  value: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  trendLinkBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sparklineContainer: {
    position: 'absolute',
    bottom: 5,
    right: -10,
    zIndex: 1,
  },
});
