import React from 'react';
import { View, Text, StyleSheet, Share } from 'react-native';
import { Screen } from '../components/layout';
import { Button } from '../components/common';
import { COLORS, SPACING } from '../constants';
import { useBets } from '../context/BetContext';
import { BET_LINK_BASE } from '../utils/links';
import { Feather } from '@expo/vector-icons';

const shareLink = async (title, link) => {
  try {
    await Share.share({
      message: `${title}\n\n${link}`,
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
        <Text style={styles.title}>Bet not found</Text>
      </Screen>
    );
  }

  const betLink = `${BET_LINK_BASE}${bet.id}`;

  return (
    <Screen scroll={false} contentStyle={styles.screen}>
      <View style={styles.celebration}>
        <View style={styles.iconCircle}>
          <Feather name="check" size={48} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>Event Created!</Text>
        <Text style={styles.subtitle}>{bet.title}</Text>
        <Text style={styles.code}>Code: {bet.id}</Text>
      </View>

      <View style={styles.actions}>
        <Button
          label="Share Your Event"
          onPress={() => shareLink(`Join my bet: ${bet.title}`, betLink)}
          icon="share"
        />
        <Button
          label="Open Event Page"
          variant="secondary"
          onPress={() => {
            navigation.replace('Main', { screen: 'Home' });
            setTimeout(() => {
              navigation.navigate('BetDetail', { betId: bet.id });
            }, 100);
          }}
          icon="arrow-right"
          style={styles.secondaryButton}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: {
    padding: 0,
    paddingBottom: 0,
  },
  celebration: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xxl,
  },
  title: {
    fontSize: 36,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  code: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  actions: {
    padding: SPACING.xl,
    paddingBottom: SPACING.xxxl,
    gap: SPACING.md,
    backgroundColor: COLORS.background,
  },
  secondaryButton: {
    marginTop: SPACING.xs,
  },
});

export default CreateSuccessScreen;
