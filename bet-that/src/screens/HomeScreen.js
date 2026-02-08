import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen, TopBar } from '../components/layout';
import { Button, Card, Input, BetCard, EmptyState, SegmentedControl } from '../components/common';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants';
import { useBets } from '../context/BetContext';
import { parseLinkId } from '../utils/links';
import { getBetStatus } from '../utils/betMath';

const HomeScreen = ({ navigation }) => {
  const { bets, sampleBetId } = useBets();
  const [betLink, setBetLink] = useState('');
  const [linkType, setLinkType] = useState('event');
  const [error, setError] = useState('');

  const recentBets = bets.filter((bet) => !bet.isExample).slice(0, 3);

  const handleOpenLink = () => {
    const id = parseLinkId(betLink, linkType === 'event' ? 'bet' : 'creator');
    if (!id) {
      setError('Paste a valid link.');
      return;
    }
    setError('');
    if (linkType === 'event') {
      navigation.navigate('BetDetail', { betId: id });
    } else {
      navigation.navigate('CreatorDashboard', { creatorId: id });
    }
  };

  return (
    <Screen>
      <TopBar onRightPress={() => navigation.navigate('Guide')} />
      <Text style={styles.headline}>Quick bets, clear results</Text>
      <Text style={styles.subhead}>Tap below to start or open a link.</Text>
      <View style={styles.actionRow}>
        <Card style={styles.actionCard}>
          <View style={styles.actionIcon}>
            <Feather name="plus" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.actionTitle}>Create a bet</Text>
          <Text style={styles.actionCopy}>Event, outcomes, close time.</Text>
          <Button
            label="New bet"
            onPress={() => navigation.navigate('Create')}
            accessibilityLabel="Create a new bet"
          />
        </Card>
        <Card style={styles.actionCard}>
          <View style={styles.actionIcon}>
            <Feather name="link" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.actionTitle}>Join by link</Text>
          <Text style={styles.actionCopy}>Event link or creator link.</Text>
          <View style={styles.segmented}>
            <SegmentedControl
              options={[
                { label: 'Event', value: 'event' },
                { label: 'Creator', value: 'creator' },
              ]}
              value={linkType}
              onChange={(value) => {
                setLinkType(value);
                if (error) {
                  setError('');
                }
              }}
            />
          </View>
          <Input
            value={betLink}
            onChangeText={(text) => {
              setBetLink(text);
              if (error) {
                setError('');
              }
            }}
            placeholder={
              linkType === 'event'
                ? 'betthat.app/bet/...'
                : 'betthat.app/creator/...'
            }
            error={error}
            autoCapitalize="none"
          />
          <Button
            label={linkType === 'event' ? 'Open bet' : 'Open creator view'}
            variant="secondary"
            onPress={handleOpenLink}
          />
        </Card>
      </View>
      <Card style={styles.guideCard}>
        <View style={styles.guideRow}>
          <View style={styles.actionIcon}>
            <Feather name="play-circle" size={20} color={COLORS.primary} />
          </View>
          <View style={styles.guideText}>
            <Text style={styles.actionTitle}>How it works</Text>
            <Text style={styles.actionCopy}>Three quick steps, no accounts.</Text>
          </View>
        </View>
        <Button
          label="View guide"
          variant="secondary"
          onPress={() => navigation.navigate('Guide')}
        />
      </Card>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent bets</Text>
        <Button
          label="Example bet"
          variant="ghost"
          onPress={() => navigation.navigate('BetDetail', { betId: sampleBetId })}
        />
      </View>
      {recentBets.length === 0 ? (
        <EmptyState
          icon="flag"
          title="No bets yet"
          message="Create a bet or open a shared link to get started."
          actionLabel="Create your first bet"
          onAction={() => navigation.navigate('Create')}
        />
      ) : (
        recentBets.map((bet) => (
          <BetCard
            key={bet.id}
            bet={bet}
            status={getBetStatus(bet, Date.now())}
            onPress={() => navigation.navigate('BetDetail', { betId: bet.id })}
          />
        ))
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  headline: {
    fontSize: TYPOGRAPHY.headline,
    fontWeight: '700',
    color: COLORS.text,
  },
  subhead: {
    fontSize: TYPOGRAPHY.body,
    color: COLORS.muted,
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  actionRow: {
    gap: SPACING.lg,
  },
  actionCard: {
    marginBottom: SPACING.md,
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  actionCopy: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
  segmented: {
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  guideCard: {
    marginTop: SPACING.md,
  },
  guideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  guideText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
});

export default HomeScreen;
