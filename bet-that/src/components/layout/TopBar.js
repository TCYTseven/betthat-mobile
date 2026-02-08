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
        <Feather name={rightIcon} size={18} color={COLORS.primary} />
      </Pressable>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.highlight,
  },
});

export { TopBar };
