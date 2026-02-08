import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants';
import { Button } from './Button';

const ConfirmModal = ({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}) => (
  <Modal
    transparent={true}
    visible={!!visible}
    animationType="fade"
    onRequestClose={onCancel}
  >
    <View style={styles.overlay}>
      <View style={styles.sheet}>
        <Text style={styles.title}>{title}</Text>
        {message ? <Text style={styles.message}>{message}</Text> : null}
        <Button label={confirmLabel} onPress={onConfirm} style={styles.confirm} />
        <Pressable onPress={onCancel} accessibilityRole="button">
          <Text style={styles.cancel}>{cancelLabel}</Text>
        </Pressable>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  sheet: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  message: {
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  confirm: {
    marginTop: SPACING.lg,
    alignSelf: 'stretch',
  },
  cancel: {
    marginTop: SPACING.sm,
    color: COLORS.muted,
    fontWeight: '600',
  },
});

export { ConfirmModal };
