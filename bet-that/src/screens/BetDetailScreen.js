import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Share, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../components/layout';
import { Badge, Button, Card, OutcomeCard } from '../components/common';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants';
import { useBets } from '../context/BetContext';
import { useNow } from '../hooks/useNow';
import {
  formatAmount,
  formatCountdown,
  formatDateTime,
} from '../utils/formatters';
import { BET_LINK_BASE } from '../utils/links';
import { getBetStatus, getOutcomeTotals, sumValues } from '../utils/betMath';

const shareLink = async (title, link) => {
  try {
    await Share.share({
      message: `${title}\n${link}`,
    });
  } catch (error) {
    // Non-blocking.
  }
};

const BetDetailScreen = ({ route, navigation }) => {
  const { betId } = route.params;
  const { bets } = useBets();
  const bet = bets.find((item) => item.id === betId);
  const now = useNow(15000);
  const [selectedOutcome, setSelectedOutcome] = useState(null);
  const [showDescription, setShowDescription] = useState(false);
  const [showRules, setShowRules] = useState(false);

  if (!bet) {
    return (
      <Screen>
        <Text style={styles.title}>Bet not found</Text>
        <Text style={styles.helper}>
          This link does not match a bet on this device.
        </Text>
        <Button
          label="Back to Home"
          onPress={() => navigation.navigate('Home')}
          style={{ marginTop: SPACING.lg }}
        />
      </Screen>
    );
  }

  const status = getBetStatus(bet, now);
  const totals = getOutcomeTotals(bet);
  const poolTotal = sumValues(Object.values(totals));
  const participantsCount = bet.participants.length;
  const localEntries = bet.participants.filter((participant) => participant.isLocal);
  const latestEntry = localEntries[localEntries.length - 1];

  const outcomesWithShare = bet.outcomes.map((outcome) => {
    const total = totals[outcome.id] || 0;
    const share = poolTotal > 0 ? total / poolTotal : 0;
    return { ...outcome, total, share };
  });

  return (
    <Screen>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{bet.title}</Text>
        <Badge label={status} status={status} />
      </View>
      <Text style={styles.helper}>{participantsCount} joined</Text>

      <Card style={styles.timerCard}>
        <View style={styles.timerRow}>
          <View>
            <Text style={styles.sectionTitle}>Time left</Text>
            <Text style={styles.countdown}>{formatCountdown(bet.closeAt, now)}</Text>
            <Text style={styles.helper}>Closes {formatDateTime(bet.closeAt)}</Text>
          </View>
          <View style={styles.timerIcon}>
            <Feather name="clock" size={22} color={COLORS.primary} />
          </View>
        </View>
      </Card>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Pool</Text>
          <Text style={styles.statValue}>{formatAmount(poolTotal)}</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Players</Text>
          <Text style={styles.statValue}>{participantsCount}</Text>
        </Card>
      </View>

      {latestEntry ? (
        <Card style={styles.joinCard}>
          <Text style={styles.sectionTitle}>You are in</Text>
          <Text style={styles.helper}>
            {latestEntry.name} · {formatAmount(latestEntry.amount)} on{' '}
            {bet.outcomes.find((item) => item.id === latestEntry.outcomeId)?.label}
          </Text>
          <Text style={styles.helper}>Names can repeat. Entries stay locked.</Text>
        </Card>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Outcome snapshot</Text>
        {outcomesWithShare.slice(0, 3).map((outcome) => (
          <OutcomeCard
            key={outcome.id}
            label={outcome.label}
            total={outcome.total}
            share={outcome.share}
            selected={selectedOutcome === outcome.id}
            onPress={() => setSelectedOutcome(outcome.id)}
            showShare={poolTotal > 0}
          />
        ))}
        {outcomesWithShare.length > 3 ? (
          <Button
            label="View all outcomes"
            variant="ghost"
            onPress={() => navigation.navigate('PoolDetails', { betId: bet.id })}
          />
        ) : null}
      </View>

      <View style={styles.ctaRow}>
        <Button
          label={
            status === 'open'
              ? selectedOutcome
                ? 'Join with selection'
                : 'Join bet'
              : 'Bet closed'
          }
          onPress={() =>
            navigation.navigate('JoinBet', { betId: bet.id, outcomeId: selectedOutcome })
          }
          disabled={status !== 'open'}
          icon="arrow-right"
          style={styles.ctaPrimary}
        />
        <Button
          label="View pool"
          variant="secondary"
          onPress={() => navigation.navigate('PoolDetails', { betId: bet.id })}
        />
      </View>

      {bet.description ? (
        <Pressable
          onPress={() => setShowDescription((prev) => !prev)}
          style={styles.toggleCard}
          accessibilityRole="button"
          accessibilityLabel="Toggle description"
        >
          <View style={styles.toggleHeader}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Feather name={showDescription ? 'chevron-up' : 'chevron-down'} size={18} />
          </View>
          {showDescription ? (
            <Text style={styles.helper}>{bet.description}</Text>
          ) : null}
        </Pressable>
      ) : null}

      {bet.rules ? (
        <Pressable
          onPress={() => setShowRules((prev) => !prev)}
          style={styles.toggleCard}
          accessibilityRole="button"
          accessibilityLabel="Toggle rules"
        >
          <View style={styles.toggleHeader}>
            <Text style={styles.sectionTitle}>Rules</Text>
            <Feather name={showRules ? 'chevron-up' : 'chevron-down'} size={18} />
          </View>
          {showRules ? <Text style={styles.helper}>{bet.rules}</Text> : null}
        </Pressable>
      ) : null}

      {status === 'resolved' ? (
        <Card style={styles.resultCard}>
          <Text style={styles.sectionTitle}>This bet is resolved</Text>
          <Text style={styles.helper}>View the settlement breakdown.</Text>
          <Button
            label="View results"
            onPress={() => navigation.navigate('Results', { betId: bet.id })}
            icon="award"
          />
        </Card>
      ) : status === 'closed' ? (
        <Card style={styles.resultCard}>
          <Text style={styles.sectionTitle}>Betting is closed</Text>
          <Text style={styles.helper}>Waiting for the creator to resolve.</Text>
        </Card>
      ) : null}

      <Card style={styles.shareCard}>
        <Text style={styles.sectionTitle}>Share this bet</Text>
        <Text style={styles.linkText}>{BET_LINK_BASE + bet.id}</Text>
        <Button
          label="Share link"
          variant="secondary"
          icon="share"
          onPress={() => shareLink(`Join the bet: ${bet.title}`, BET_LINK_BASE + bet.id)}
        />
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
    alignItems: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.title,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  helper: {
    color: COLORS.muted,
    marginTop: SPACING.xs,
  },
  timerCard: {
    marginTop: SPACING.lg,
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.highlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.subhead,
    fontWeight: '700',
    color: COLORS.text,
  },
  countdown: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  toggleCard: {
    marginTop: SPACING.md,
    padding: SPACING.lg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  toggleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.md,
  },
  statLabel: {
    color: COLORS.muted,
    fontSize: 13,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  joinCard: {
    marginTop: SPACING.lg,
  },
  section: {
    marginTop: SPACING.xl,
  },
  ctaRow: {
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  ctaPrimary: {
    marginBottom: SPACING.xs,
  },
  resultCard: {
    marginTop: SPACING.lg,
  },
  shareCard: {
    marginTop: SPACING.lg,
  },
  linkText: {
    color: COLORS.primaryDark,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
});

export default BetDetailScreen;
