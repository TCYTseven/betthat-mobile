import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants';

const TopBar = ({ title = 'Bet That', rightIcon = 'help-circle', onRightPress }) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    {onRightPress ? (
      <Pressable
        onPress={onRightPress}
        style={styles.iconButton}
        accessibilityRole="button"
        accessibilityLabel="Help"
      >
        <Feather name={rightIcon} size={20} color={COLORS.muted} />
      </Pressable>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xxl,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  iconButton: {
    padding: SPACING.xs,
  },
});

export { TopBar };
