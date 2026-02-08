import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen, TopBar } from '../components/layout';
import { Button, Card, BetCard, EmptyState } from '../components/common';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants';
import { useBets } from '../context/BetContext';
import { getBetStatus } from '../utils/betMath';

const HomeScreen = ({ navigation }) => {
  const { bets } = useBets();

  // Only show the very latest active bet if it exists, otherwise show empty state
  const activeBets = bets.filter((bet) => !bet.isExample).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const latestBet = activeBets[0];

  return (
    <Screen>
      <TopBar 
        onRightPress={() => navigation.navigate('Guide')} 
        rightIcon="help-circle"
      />
      
      <View style={styles.header}>
        <Text style={styles.headline}>Bet That</Text>
        <Text style={styles.subhead}>Friendly bets, zero friction.</Text>
      </View>

      <View style={styles.mainAction}>
        <Card style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Feather name="plus" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.heroTitle}>Create New Bet</Text>
          <Text style={styles.heroCopy}>Set up an event and share the code with friends.</Text>
          <Button
            label="Create Bet"
            variant="secondary"
            onPress={() => navigation.navigate('Create')}
            accessibilityLabel="Create a new bet"
          />
        </Card>
      </View>

      {latestBet && (
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Continue betting</Text>
            <Pressable onPress={() => navigation.navigate('MyBets')}>
              <Text style={styles.viewAll}>View all</Text>
            </Pressable>
          </View>
          <BetCard
            bet={latestBet}
            status={getBetStatus(latestBet, Date.now())}
            onPress={() => navigation.navigate('BetDetail', { betId: latestBet.id })}
          />
        </View>
      )}

      {!latestBet && (
        <View style={styles.tipContainer}>
          <Feather name="info" size={16} color={COLORS.muted} />
          <Text style={styles.tipText}>Tip: Share your bet link in any group chat to let friends join.</Text>
        </View>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xxl,
  },
  headline: {
    fontSize: 40,
    fontWeight: '300',
    color: COLORS.text,
    letterSpacing: -1.5,
  },
  subhead: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.muted,
    marginTop: SPACING.sm,
  },
  mainAction: {
    marginBottom: SPACING.xxl,
  },
  heroCard: {
    padding: SPACING.xxl,
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderWidth: 0,
    borderRadius: 0,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: SPACING.sm,
  },
  heroCopy: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  recentSection: {
    marginTop: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
  tipContainer: {
    display: 'none',
  },
  tipText: {
    display: 'none',
  },
});

export default HomeScreen;
