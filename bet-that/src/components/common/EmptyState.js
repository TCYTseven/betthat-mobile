import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants';
import { Button } from './Button';

const EmptyState = ({ icon, title, message, actionLabel, onAction }) => (
  <View style={styles.container}>
    <View style={styles.iconBubble}>
      <Feather name={icon || 'inbox'} size={26} color={COLORS.primary} />
    </View>
    <Text style={styles.title}>{title}</Text>
    {message ? <Text style={styles.message}>{message}</Text> : null}
    {actionLabel ? (
      <Button
        label={actionLabel}
        onPress={onAction}
        variant="secondary"
        style={styles.action}
      />
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: SPACING.xl,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  iconBubble: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  action: {
    marginTop: SPACING.lg,
  },
});

export { EmptyState };
