import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { COLORS, SPACING } from '../../constants';

const LoadingSpinner = ({ label }) => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color={COLORS.primary} />
    {label ? <Text style={styles.label}>{label}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginTop: SPACING.sm,
    color: COLORS.muted,
  },
});

export { LoadingSpinner };
