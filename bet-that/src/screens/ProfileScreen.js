import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Screen, TopBar } from '../components/layout';
import { Button, Card } from '../components/common';
import { COLORS, SPACING } from '../constants';
import { useOnboarding } from '../context/OnboardingContext';
import { useBets } from '../context/BetContext';

const ProfileScreen = ({ navigation }) => {
  const { resetOnboarding } = useOnboarding();
  const { resetBets, sampleBetId } = useBets();

  return (
    <Screen>
      <TopBar title="Settings" />
      <Card>
        <Text style={styles.sectionTitle}>Quick actions</Text>
        <Button
          label="How Bet That works"
          variant="secondary"
          onPress={() => navigation.navigate('Guide')}
          icon="play-circle"
          style={styles.buttonSpacing}
        />
        <Button
          label="View example bet"
          variant="secondary"
          onPress={() => navigation.navigate('BetDetail', { betId: sampleBetId })}
          icon="eye"
          style={styles.buttonSpacing}
        />
        <Button
          label="Reset onboarding"
          variant="ghost"
          onPress={resetOnboarding}
          icon="refresh-ccw"
          style={styles.buttonSpacing}
        />
        <Button
          label="Reset demo data"
          variant="ghost"
          onPress={resetBets}
          icon="trash-2"
          style={styles.buttonSpacing}
        />
      </Card>
      <Card style={styles.cardSpacing}>
        <Text style={styles.helper}>
          Bet That never handles payments. All settlement happens offline.
        </Text>
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  helper: {
    color: COLORS.muted,
  },
  buttonSpacing: {
    marginTop: SPACING.sm,
  },
  cardSpacing: {
    marginTop: SPACING.md,
  },
});

export default ProfileScreen;
