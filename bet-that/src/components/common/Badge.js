import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING, STATUS_COLORS } from '../../constants';

const Badge = ({ label, status }) => {
  const tint = STATUS_COLORS[status] || COLORS.primary;
  const textLabel =
    typeof label === 'string' && label.length > 0
      ? label.charAt(0).toUpperCase() + label.slice(1)
      : label;
  return (
    <View style={[styles.badge, { backgroundColor: `${tint}22` }]}>
      <Text style={[styles.text, { color: tint }]}>{textLabel}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export { Badge };
