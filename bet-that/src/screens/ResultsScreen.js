import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../components/layout';
import { Button, Card } from '../components/common';
import { COLORS, SPACING } from '../constants';
import { useBets } from '../context/BetContext';
import { calculateResults } from '../utils/betMath';
import { formatAmount } from '../utils/formatters';

const ResultsScreen = ({ route, navigation }) => {
  const { betId } = route.params;
  const { bets } = useBets();
  const bet = bets.find((item) => item.id === betId);
  const results = bet ? calculateResults(bet) : null;

  if (!bet || !results) {
    return (
      <Screen>
        <Text style={styles.title}>Results not available</Text>
        <Button label="Back to Home" onPress={() => navigation.navigate('Home')} />
      </Screen>
    );
  }

  const winningOutcome = bet.outcomes.find(
    (outcome) => outcome.id === bet.winningOutcomeId
  );

  return (
    <Screen>
      <View style={styles.winnerHeader}>
        <View style={styles.trophy}>
          <Feather name="award" size={22} color={COLORS.primary} />
        </View>
        <View>
          <Text style={styles.title}>Final results</Text>
          <Text style={styles.helper}>
            Winning outcome: {winningOutcome ? winningOutcome.label : 'Unknown'}
          </Text>
        </View>
      </View>
      <Card style={styles.cardSpacing}>
        <Text style={styles.sectionTitle}>Pool totals</Text>
        <Text style={styles.poolTotal}>
          Total pool: {formatAmount(results.poolTotal)}
        </Text>
        <Text style={styles.helper}>
          Winning side: {formatAmount(results.totalWinStake)} · Losing side:{' '}
          {formatAmount(results.totalLoserStake)}
        </Text>
      </Card>

      {results.winners.length === 0 ? (
        <Card style={styles.cardSpacing}>
          <Text style={styles.sectionTitle}>No winners this time</Text>
          <Text style={styles.helper}>No one picked the winning outcome.</Text>
        </Card>
      ) : (
        <>
          <Card style={styles.cardSpacing}>
            <Text style={styles.sectionTitle}>Winners</Text>
            {results.winners.map((winner) => (
              <View key={winner.id} style={styles.rowBetween}>
                <Text style={styles.winnerName}>{winner.name}</Text>
                <Text style={styles.winnerAmount}>
                  +{formatAmount(winner.net)}
                </Text>
              </View>
            ))}
          </Card>
          <Card style={styles.cardSpacing}>
            <Text style={styles.sectionTitle}>Who owes what</Text>
            {results.settlement.length === 0 ? (
              <Text style={styles.helper}>
                Everyone picked the winning outcome. Nothing is owed.
              </Text>
            ) : (
              results.settlement.map((item, index) => (
                <Text key={`${item.from}-${item.to}-${index}`} style={styles.helper}>
                  {item.from} owes {item.to} {formatAmount(item.amount)}
                </Text>
              ))
            )}
            <Text style={styles.helper}>
              Settlement happens offline. Bet That never handles payments.
            </Text>
          </Card>
        </>
      )}

      <Button
        label="Back to dashboard"
        variant="secondary"
        onPress={() => navigation.navigate('Home')}
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
  winnerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  trophy: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.highlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helper: {
    color: COLORS.muted,
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  poolTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  cardSpacing: {
    marginTop: SPACING.md,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  winnerName: {
    color: COLORS.text,
    fontWeight: '600',
  },
  winnerAmount: {
    color: COLORS.success,
    fontWeight: '700',
  },
});

export default ResultsScreen;
