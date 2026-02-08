import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants';
import { PaginationDots, Button, Card, BetCard } from '../components/common';
import { useOnboarding } from '../context/OnboardingContext';
import { useBets } from '../context/BetContext';
import { getBetStatus } from '../utils/betMath';

const slides = [
  {
    key: 'welcome',
    title: 'Bet That',
    subtitle: 'Quick, friendly bets with zero friction.',
    description: 'Create, share, and settle in minutes.',
    icon: 'sparkles',
  },
  {
    key: 'features',
    title: 'Designed for group chats',
    subtitle: 'No accounts. No payments.',
    description: 'Everyone sees the same totals and outcomes.',
    icon: 'users',
  },
  {
    key: 'how',
    title: 'How it works',
    subtitle: 'Three simple steps.',
    description: 'Create → Share → Settle offline.',
    icon: 'map',
  },
  {
    key: 'get-started',
    title: 'Ready to start?',
    subtitle: 'Create your first bet in under a minute.',
    description: 'Preview a sample bet if you want.',
    icon: 'flag',
  },
];

const OnboardingScreen = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const flatListRef = useRef(null);
  const [index, setIndex] = useState(0);
  const { completeOnboarding } = useOnboarding();
  const { bets, sampleBetId } = useBets();
  const sampleBet = bets.find((bet) => bet.id === sampleBetId);

  const handleNext = () => {
    if (index < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: index + 1, animated: true });
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    await completeOnboarding();
    navigation.replace('Main');
  };

  const renderItem = ({ item }) => (
    <View style={[styles.slide, { width }]}>
      <View style={styles.iconBubble}>
        <Feather name={item.icon} size={30} color={COLORS.primary} />
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.subtitle}</Text>
      <Text style={styles.description}>{item.description}</Text>
      {item.key === 'get-started' && sampleBet ? (
        <Card style={styles.previewCard}>
          <BetCard
            bet={sampleBet}
            status={getBetStatus(sampleBet, Date.now())}
            subtitle="Example bet preview"
            onPress={() =>
              navigation.navigate('BetDetail', { betId: sampleBet.id })
            }
          />
        </Card>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.skipRow}>
        <Pressable onPress={handleFinish} accessibilityRole="button">
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          setIndex(nextIndex);
        }}
      />
      <View style={styles.footer}>
        <PaginationDots count={slides.length} activeIndex={index} />
        <Button
          label={index === slides.length - 1 ? 'Get started' : 'Next'}
          onPress={handleNext}
          icon="arrow-right"
          style={styles.nextButton}
        />
        {index === slides.length - 1 ? (
          <Button
            label="View example bet"
            variant="secondary"
            onPress={() =>
              navigation.navigate('BetDetail', { betId: sampleBetId })
            }
          />
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  skipRow: {
    alignItems: 'flex-end',
    paddingTop: SPACING.xxl,
    paddingHorizontal: SPACING.xl,
  },
  skipText: {
    color: COLORS.muted,
    fontWeight: '600',
  },
  slide: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
  },
  iconBubble: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.title,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.subhead,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  description: {
    fontSize: TYPOGRAPHY.body,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: SPACING.md,
    maxWidth: 300,
  },
  previewCard: {
    width: '100%',
    marginTop: SPACING.xl,
  },
  footer: {
    padding: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  nextButton: {
    marginTop: SPACING.lg,
  },
});

export default OnboardingScreen;
