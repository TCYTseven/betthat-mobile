import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { Screen } from '../components/layout';
import { Card, OutcomeCard } from '../components/common';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants';
import { useBets } from '../context/BetContext';
import { getOutcomeTotals, sumValues } from '../utils/betMath';
import { formatAmount } from '../utils/formatters';

const PoolDetailsScreen = ({ route }) => {
  const { betId } = route.params;
  const { bets } = useBets();
  const bet = bets.find((item) => item.id === betId);

  if (!bet) {
    return (
      <Screen>
        <Text style={styles.title}>Pool not available</Text>
      </Screen>
    );
  }

  const totals = getOutcomeTotals(bet);
  const poolTotal = sumValues(Object.values(totals));

  return (
    <Screen>
      <Text style={styles.title}>Pool breakdown</Text>
      <Text style={styles.helper}>
        Total pool: {formatAmount(poolTotal)} · {bet.participants.length} joined
      </Text>
      <Card style={styles.cardSpacing}>
        {bet.outcomes.map((outcome) => {
          const total = totals[outcome.id] || 0;
          const share = poolTotal > 0 ? total / poolTotal : 0;
          return (
            <OutcomeCard
              key={outcome.id}
              label={outcome.label}
              total={total}
              share={share}
              showShare
            />
          );
        })}
      </Card>
      <View style={styles.note}>
        <Text style={styles.noteText}>
          Pool totals update instantly as friends join.
        </Text>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: TYPOGRAPHY.headline,
    fontWeight: '700',
    color: COLORS.text,
  },
  helper: {
    color: COLORS.muted,
    marginTop: SPACING.sm,
  },
  cardSpacing: {
    marginTop: SPACING.lg,
  },
  note: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    borderRadius: 14,
    backgroundColor: COLORS.highlight,
  },
  noteText: {
    color: COLORS.muted,
  },
});

export default PoolDetailsScreen;
