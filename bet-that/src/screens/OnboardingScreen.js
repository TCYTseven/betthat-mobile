import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants';
import { PaginationDots, Button, Card, BetCard, Input } from '../components/common';
import { useOnboarding } from '../context/OnboardingContext';
import { useBets } from '../context/BetContext';
import { getBetStatus } from '../utils/betMath';

const slides = [
  {
    key: 'tip-1',
    title: 'No Accounts',
    subtitle: 'Create and share bets instantly.',
    description: 'We handle the calculations. You handle the stakes.',
    icon: 'zap',
  },
  {
    key: 'tip-2',
    title: 'Universal Sharing',
    subtitle: 'Works in any messaging app.',
    description: 'Share bet codes across any platform. Your friends join with a single tap.',
    icon: 'message-circle',
  },
  {
    key: 'tip-3',
    title: 'Offline Settlement',
    subtitle: 'You control payouts.',
    description: 'We track who won. You settle up however works best.',
    icon: 'check-circle',
  },
  {
    key: 'name',
    title: "Your Name",
    subtitle: 'How should you appear in bets?',
    description: '',
    icon: 'user',
    showInput: true,
  },
];

const OnboardingScreen = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const flatListRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [userName, setUserName] = useState('');
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
    const name = userName.trim() || 'You';
    await completeOnboarding(name);
    navigation.replace('Main');
  };

  const renderItem = ({ item }) => (
    <View style={[styles.slide, { width }]}>
      <View style={styles.contentContainer}>
        <View style={styles.iconBubble}>
          <Feather name={item.icon} size={32} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
        <Text style={styles.description}>{item.description}</Text>
        {item.showInput && (
          <Input
            value={userName}
            onChangeText={setUserName}
            placeholder="Your name or nickname"
            style={styles.nameInput}
            containerStyle={styles.nameInputContainer}
          />
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.skipRow}>
        <Pressable onPress={handleFinish} accessibilityRole="button" hitSlop={20}>
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
        <View style={styles.paginationRow}>
          <PaginationDots count={slides.length} activeIndex={index} />
        </View>
        <Button
          label={index === slides.length - 1 ? 'Get Started' : 'Next Tip'}
          onPress={handleNext}
          icon={index === slides.length - 1 ? 'check' : 'arrow-right'}
          style={styles.nextButton}
        />
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: SPACING.xl,
    zIndex: 10,
  },
  skipText: {
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: '500',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xxl,
  },
  contentContainer: {
    alignItems: 'center',
  },
  iconBubble: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xxl,
  },
  title: {
    fontSize: 32,
    fontWeight: '300',
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  description: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: SPACING.md,
    lineHeight: 22,
    maxWidth: '90%',
  },
  footer: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: Platform.OS === 'ios' ? 50 : 30,
  },
  paginationRow: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  nextButton: {
    height: 52,
  },
  nameInputContainer: {
    marginTop: SPACING.xxl,
    width: '100%',
  },
  nameInput: {
    textAlign: 'center',
    fontSize: 18,
  },
});

export default OnboardingScreen;
