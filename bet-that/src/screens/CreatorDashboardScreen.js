import React, { useState } from 'react';
import { View, Text, StyleSheet, Share } from 'react-native';
import { Screen } from '../components/layout';
import { Badge, Button, Card, ConfirmModal } from '../components/common';
import { COLORS, SPACING } from '../constants';
import { useBets } from '../context/BetContext';
import { BET_LINK_BASE, CREATOR_LINK_BASE } from '../utils/links';
import { formatDateTime } from '../utils/formatters';
import { getBetStatus } from '../utils/betMath';

const shareLink = async (title, link) => {
  try {
    await Share.share({ message: `${title}\n${link}` });
  } catch (error) {
    // Non-blocking.
  }
};

const CreatorDashboardScreen = ({ route, navigation }) => {
  const { creatorId } = route.params;
  const { bets, closeBet } = useBets();
  const bet = bets.find((item) => item.creatorId === creatorId);
  const [showClose, setShowClose] = useState(false);

  if (!bet) {
    return (
      <Screen>
        <Text style={styles.title}>Creator link not found</Text>
        <Text style={styles.helper}>
          This creator link does not match a bet on this device.
        </Text>
        <Button
          label="Back to Home"
          onPress={() => navigation.navigate('Home')}
          style={{ marginTop: SPACING.lg }}
        />
      </Screen>
    );
  }

  const status = getBetStatus(bet, Date.now());
  const betLink = `${BET_LINK_BASE}${bet.id}`;
  const creatorLink = `${CREATOR_LINK_BASE}${bet.creatorId}`;
  const canResolve = status === 'closed';

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>{bet.title}</Text>
        <Badge label={status} status={status} />
      </View>
      <Text style={styles.helper}>
        Closes {formatDateTime(bet.closeAt)} · {bet.participants.length} joined
      </Text>
      <Card style={styles.cardSpacing}>
        <Text style={styles.cardTitle}>Event link</Text>
        <Text style={styles.linkText}>{betLink}</Text>
        <Button
          label="Share event link"
          variant="secondary"
          icon="share"
          onPress={() => shareLink(bet.title, betLink)}
        />
      </Card>
      <Card style={styles.cardSpacing}>
        <Text style={styles.cardTitle}>Creator link</Text>
        <Text style={styles.linkText}>{creatorLink}</Text>
        <Text style={styles.helper}>Keep this private.</Text>
      </Card>
      {status === 'open' ? (
        <Button
          label="Close betting now"
          icon="lock"
          onPress={() => setShowClose(true)}
          style={styles.cardSpacing}
        />
      ) : null}
      {status === 'resolved' ? (
        <Button
          label="View results"
          icon="award"
          onPress={() => navigation.navigate('Results', { betId: bet.id })}
          style={styles.cardSpacing}
        />
      ) : (
        <Button
          label="Resolve outcome"
          icon="check"
          onPress={() => navigation.navigate('ResolveOutcome', { betId: bet.id })}
          style={styles.cardSpacing}
          disabled={!canResolve}
        />
      )}
      {!canResolve && status === 'open' ? (
        <Text style={styles.helper}>
          Close betting first, then resolve the outcome.
        </Text>
      ) : null}

      <ConfirmModal
        visible={showClose}
        title="Close betting?"
        message="No one else will be able to join after you close."
        confirmLabel="Yes, close betting"
        cancelLabel="Cancel"
        onConfirm={() => {
          closeBet(bet.id);
          setShowClose(false);
        }}
        onCancel={() => setShowClose(false)}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  helper: {
    color: COLORS.muted,
    marginTop: SPACING.xs,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  linkText: {
    color: COLORS.primaryDark,
    marginBottom: SPACING.sm,
  },
  cardSpacing: {
    marginTop: SPACING.md,
  },
});

export default CreatorDashboardScreen;
