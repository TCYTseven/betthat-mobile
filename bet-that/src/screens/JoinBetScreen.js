import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { Screen, TopBar } from '../components/layout';
import { Button } from '../components/common';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants';
import { parseLinkId } from '../utils/links';

const JoinBetScreen = ({ navigation }) => {
  const [betLink, setBetLink] = useState('');
  const [error, setError] = useState('');

  const handleOpenLink = () => {
    const id = parseLinkId(betLink);
    if (!id) {
      setError('Enter a valid bet code');
      return;
    }
    setError('');
    navigation.navigate('BetDetail', { betId: id });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}
    >
      <Screen>
        <TopBar title="Join Bet" />
        <View style={styles.container}>
          <Text style={styles.label}>Bet Code</Text>
          <TextInput
            value={betLink}
            onChangeText={(text) => {
              setBetLink(text);
              if (error) setError('');
            }}
            placeholder="Paste code or link"
            placeholderTextColor={COLORS.muted}
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button
            label="Join Bet"
            onPress={handleOpenLink}
            style={styles.button}
          />
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    marginTop: SPACING.xl,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  input: {
    fontSize: 24,
    fontWeight: '300',
    color: COLORS.text,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.md,
  },
  error: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.danger,
    marginBottom: SPACING.lg,
  },
  button: {
    marginTop: SPACING.xxl,
  },
});

export default JoinBetScreen;
