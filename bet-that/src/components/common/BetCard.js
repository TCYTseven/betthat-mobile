import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../../constants';
import { Badge } from './Badge';
import { formatDateTime } from '../../utils/formatters';

const BetCard = ({ bet, status, onPress, subtitle }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    accessibilityRole="button"
    accessibilityLabel={`Open bet ${bet.title}`}
  >
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <Feather name="flag" size={16} color={COLORS.primary} />
        <Text style={styles.title} numberOfLines={1}>
          {bet.title}
        </Text>
      </View>
      <Badge label={status} status={status} />
    </View>
    <Text style={styles.meta}>
      Closes {formatDateTime(bet.closeAt)} · {bet.participants.length} joined
    </Text>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  cardPressed: {
    opacity: 0.9,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  meta: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: SPACING.sm,
  },
  subtitle: {
    color: COLORS.text,
    fontSize: 14,
    marginTop: SPACING.sm,
  },
});

export { BetCard };
