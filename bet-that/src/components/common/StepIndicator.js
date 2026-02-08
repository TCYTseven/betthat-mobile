import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants';

const StepIndicator = ({ current, total }) => (
  <View style={styles.container}>
    <View style={styles.dots}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={`step-${index}`}
          style={[
            styles.dot,
            index === current && styles.dotActive,
          ]}
        />
      ))}
    </View>
    <Text style={styles.label}>
      Step {current + 1} of {total}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  dots: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.border,
  },
  dotActive: {
    width: 22,
    backgroundColor: COLORS.primary,
  },
  label: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '600',
  },
});

export { StepIndicator };
