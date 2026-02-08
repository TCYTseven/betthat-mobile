import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants';
import { formatAmount } from '../../utils/formatters';

const OutcomeCard = ({
  label,
  total,
  share,
  selected,
  onPress,
  showShare,
}) => {
  const isPressable = typeof onPress === 'function';
  return (
    <Pressable
      onPress={isPressable ? onPress : undefined}
      disabled={!isPressable}
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardSelected,
        pressed && isPressable && styles.cardPressed,
      ]}
      accessibilityRole={isPressable ? 'button' : 'none'}
      accessibilityLabel={`Outcome ${label}`}
    >
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      {typeof total === 'number' ? (
        <Text style={styles.total}>{formatAmount(total)}</Text>
      ) : null}
    </View>
    {!!showShare ? (
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${Math.round(share * 100)}%` }]} />
      </View>
    ) : null}
    {!!showShare ? (
      <Text style={styles.shareText}>{Math.round(share * 100)}% of pool</Text>
    ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  cardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.highlight,
  },
  cardPressed: {
    opacity: 0.85,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  total: {
    fontSize: 14,
    color: COLORS.muted,
  },
  barTrack: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.pill,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
  },
  shareText: {
    marginTop: SPACING.xs,
    color: COLORS.muted,
    fontSize: 12,
  },
});

export { OutcomeCard };
