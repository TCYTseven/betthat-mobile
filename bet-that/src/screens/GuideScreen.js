import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, useWindowDimensions, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen, TopBar } from '../components/layout';
import { Button, Card, PaginationDots } from '../components/common';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants';

const guideSteps = [
  {
    key: 'create',
    title: '1. Create',
    description: 'Set your event title, possible outcomes, and when betting should close.',
    icon: 'edit-3',
  },
  {
    key: 'share',
    title: '2. Share',
    description: 'Copy the unique bet code and share it with friends in any group chat.',
    icon: 'send',
  },
  {
    key: 'join',
    title: '3. Join',
    description: 'Friends enter the code to pick their outcome and place their wager.',
    icon: 'user-plus',
  },
  {
    key: 'settle',
    title: '4. Settle',
    description: 'Once the event ends, we show who won. Settle up however you like!',
    icon: 'check-circle',
  },
];

const GuideScreen = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const listRef = useRef(null);

  return (
    <Screen scroll={false} contentStyle={styles.screen}>
      <TopBar title="How it works" />
      <View style={styles.container}>
        <View style={styles.pagerContainer}>
          <FlatList
            ref={listRef}
            data={guideSteps}
            horizontal
            pagingEnabled
            keyExtractor={(item) => item.key}
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const nextIndex = Math.round(
                event.nativeEvent.contentOffset.x / (width - SPACING.xl * 2)
              );
              setIndex(nextIndex);
            }}
            renderItem={({ item }) => (
              <View style={[styles.slide, { width: width - SPACING.xl * 2 }]}>
                <View style={styles.iconBubble}>
                  <Feather name={item.icon} size={32} color={COLORS.primary} />
                </View>
                <Text style={styles.stepTitle}>{item.title}</Text>
                <Text style={styles.stepCopy}>{item.description}</Text>
              </View>
            )}
          />
        </View>
        
        <View style={styles.footer}>
          <PaginationDots count={guideSteps.length} activeIndex={index} />
          <Button
            label={index === guideSteps.length - 1 ? 'Start Betting' : 'Next Step'}
            icon={index === guideSteps.length - 1 ? 'play' : 'arrow-right'}
            onPress={() => {
              if (index === guideSteps.length - 1) {
                navigation.goBack();
              } else {
                listRef.current?.scrollToIndex({ index: index + 1, animated: true });
              }
            }}
            style={styles.button}
          />
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: {
    padding: 0,
    backgroundColor: '#FFFFFF',
  },
  container: {
    padding: SPACING.xl,
    flex: 1,
  },
  pagerContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
  },
  iconBubble: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  stepCopy: {
    fontSize: 16,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: SPACING.md,
  },
  footer: {
    gap: SPACING.xl,
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  button: {
    width: '100%',
  },
});

export default GuideScreen;
