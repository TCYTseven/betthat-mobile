import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants';

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  helper,
  multiline,
  style,
  containerStyle,
  ...props
}) => (
  <View style={[styles.wrapper, containerStyle]}>
    {label ? <Text style={styles.label}>{label}</Text> : null}
    <TextInput
      style={[
        styles.input,
        multiline && styles.multiline,
        error && styles.inputError,
        style,
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={COLORS.muted}
      multiline={!!multiline}
      accessibilityLabel={label || placeholder}
      {...props}
    />
    {error ? <Text style={styles.error}>{error}</Text> : null}
    {helper ? <Text style={styles.helper}>{helper}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  input: {
    borderWidth: 0,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 0,
    paddingVertical: SPACING.md,
    paddingHorizontal: 0,
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.text,
    backgroundColor: 'transparent',
    minHeight: 44,
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  inputError: {
    borderBottomColor: COLORS.danger,
  },
  error: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '500',
    marginTop: SPACING.sm,
  },
  helper: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: SPACING.sm,
  },
});

export { Input };
