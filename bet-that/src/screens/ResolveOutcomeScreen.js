import React, { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { Screen } from '../components/layout';
import { Button, Card } from '../components/common';
import { COLORS, SPACING } from '../constants';
import { useBets } from '../context/BetContext';

const ResolveOutcomeScreen = ({ route, navigation }) => {
  const { betId } = route.params;
  const { bets, resolveBet } = useBets();
  const bet = bets.find((item) => item.id === betId);
  const [selected, setSelected] = useState(null);

  if (!bet) {
    return (
      <Screen>
        <Text style={styles.title}>Bet not found</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.title}>Resolve outcome</Text>
      <Text style={styles.helper}>Pick the winning outcome to finalize.</Text>
      {bet.outcomes.map((outcome) => (
        <Card key={outcome.id} style={styles.cardSpacing}>
          <Button
            label={outcome.label}
            variant={selected === outcome.id ? 'primary' : 'secondary'}
            onPress={() => setSelected(outcome.id)}
          />
        </Card>
      ))}
      <Text style={styles.helper}>
        This cannot be undone. Everyone will see the results.
      </Text>
      <Button
        label="Confirm winning outcome"
        onPress={() => {
          resolveBet(bet.id, selected);
          navigation.replace('Results', { betId: bet.id });
        }}
        disabled={!selected}
        icon="check"
        style={styles.cardSpacing}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  helper: {
    color: COLORS.muted,
    marginTop: SPACING.sm,
  },
  cardSpacing: {
    marginTop: SPACING.md,
  },
});

export default ResolveOutcomeScreen;
