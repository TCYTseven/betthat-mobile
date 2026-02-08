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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  option: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    alignItems: 'center',
    marginBottom: -1,
  },
  optionActive: {
    borderBottomColor: COLORS.primary,
  },
  label: {
    color: COLORS.muted,
    fontWeight: '500',
    fontSize: 14,
  },
  labelActive: {
    color: COLORS.text,
    fontWeight: '600',
  },
});

export { SegmentedControl };
