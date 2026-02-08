import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../constants';

const StepIndicator = ({ current, total }) => {
  const progress = ((current + 1) / total) * 100;
  
  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <View style={[styles.progress, { width: `${progress}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xxl,
    marginHorizontal: -SPACING.xl,
  },
  track: {
    height: 3,
    backgroundColor: COLORS.border,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
});

export { StepIndicator };
