import React from 'react';
import { View, Text, StyleSheet, Share } from 'react-native';
import { Screen, TopBar } from '../components/layout';
import { Button, Card } from '../components/common';
import { COLORS, SPACING } from '../constants';
import { useBets } from '../context/BetContext';
import { BET_LINK_BASE, CREATOR_LINK_BASE } from '../utils/links';

const shareLink = async (title, link) => {
  try {
    await Share.share({
      message: `${title}\n${link}`,
    });
  } catch (error) {
    // Non-blocking.
  }
};

const CreateSuccessScreen = ({ route, navigation }) => {
  const { betId } = route.params;
  const { bets } = useBets();
  const bet = bets.find((item) => item.id === betId);

  if (!bet) {
    return (
      <Screen>
        <TopBar title="Bet That" />
        <Text style={styles.title}>Bet not found</Text>
        <Text style={styles.helper}>
          We could not find this bet on the device.
        </Text>
      </Screen>
    );
  }

  const betLink = `${BET_LINK_BASE}${bet.id}`;
  const creatorLink = `${CREATOR_LINK_BASE}${bet.creatorId}`;

  return (
    <Screen>
      <TopBar title="Share your bet" />
      <Text style={styles.title}>You are ready to share</Text>
      <Text style={styles.helper}>
        Send the event link to friends. Keep the creator link private so you can
        resolve the outcome later.
      </Text>
      <Card>
        <Text style={styles.cardTitle}>Event link</Text>
        <Text style={styles.linkText}>{betLink}</Text>
        <Button
          label="Share event link"
          onPress={() => shareLink(`Join the bet: ${bet.title}`, betLink)}
          icon="share"
        />
      </Card>
      <Card style={styles.cardSpacing}>
        <Text style={styles.cardTitle}>Creator link</Text>
        <Text style={styles.linkText}>{creatorLink}</Text>
        <Button
          label="Open creator view"
          variant="secondary"
          onPress={() =>
            navigation.navigate('CreatorDashboard', { creatorId: bet.creatorId })
          }
          icon="shield"
        />
      </Card>
      <Card style={styles.cardSpacing}>
        <Text style={styles.helper}>
          Bet That never handles payments. Settle however your group prefers.
        </Text>
      </Card>
      <Button
        label="Open event page"
        onPress={() => navigation.navigate('BetDetail', { betId: bet.id })}
        icon="arrow-right"
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
    marginBottom: SPACING.sm,
  },
  helper: {
    color: COLORS.muted,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  linkText: {
    color: COLORS.primaryDark,
    marginBottom: SPACING.md,
  },
  cardSpacing: {
    marginTop: SPACING.md,
  },
});

export default CreateSuccessScreen;
