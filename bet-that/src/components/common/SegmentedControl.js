import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants';

const SegmentedControl = ({ options, value, onChange }) => (
  <View style={styles.container}>
    {options.map((option) => {
      const active = option.value === value;
      return (
        <Pressable
          key={option.value}
          onPress={() => onChange(option.value)}
          style={[styles.option, active && styles.optionActive]}
          accessibilityRole="button"
          accessibilityLabel={option.label}
        >
          <Text style={[styles.label, active && styles.labelActive]}>
            {option.label}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.pill,
    padding: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  option: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
  },
  optionActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: COLORS.shadow,
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  label: {
    color: COLORS.muted,
    fontWeight: '600',
  },
  labelActive: {
    color: COLORS.primary,
  },
});

export { SegmentedControl };
