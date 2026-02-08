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
      multiline={multiline}
      accessibilityLabel={label || placeholder}
      {...props}
    />
    {error ? <Text style={styles.error}>{error}</Text> : null}
    {helper ? <Text style={styles.helper}>{helper}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: '#FFFFFF',
    minHeight: 44,
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  error: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: SPACING.xs,
  },
  helper: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: SPACING.xs,
  },
});

export { Input };
