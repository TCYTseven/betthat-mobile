import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../components/layout';
import { Button, Card, PaginationDots } from '../components/common';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants';

const guideSteps = [
  {
    key: 'create',
    title: 'Create a bet',
    description: 'Set a short title, outcomes, and a close time.',
    icon: 'edit-3',
  },
  {
    key: 'share',
    title: 'Share the link',
    description: 'Friends join from any group chat. No accounts needed.',
    icon: 'send',
  },
  {
    key: 'settle',
    title: 'Settle offline',
    description: 'We show who owes what. You settle however you like.',
    icon: 'check-circle',
  },
];

const GuideScreen = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const listRef = useRef(null);

  return (
    <Screen scroll={false} contentStyle={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.title}>How Bet That works</Text>
        <Card style={styles.card}>
          <FlatList
            ref={listRef}
            data={guideSteps}
            horizontal
            pagingEnabled
            keyExtractor={(item) => item.key}
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const nextIndex = Math.round(
                event.nativeEvent.contentOffset.x / width
              );
              setIndex(nextIndex);
            }}
            renderItem={({ item }) => (
              <View style={[styles.slide, { width: width - SPACING.xl * 2 }]}>
                <View style={styles.iconBubble}>
                  <Feather name={item.icon} size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.stepTitle}>{item.title}</Text>
                <Text style={styles.stepCopy}>{item.description}</Text>
              </View>
            )}
          />
          <PaginationDots count={guideSteps.length} activeIndex={index} />
        </Card>
        <Button
          label={index === guideSteps.length - 1 ? 'Got it' : 'Next step'}
          icon="arrow-right"
          onPress={() => {
            if (index === guideSteps.length - 1) {
              navigation.goBack();
            } else {
              listRef.current?.scrollToIndex({ index: index + 1, animated: true });
            }
          }}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: {
    padding: 0,
  },
  container: {
    padding: SPACING.xl,
    flex: 1,
    justifyContent: 'center',
    gap: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.headline,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  card: {
    alignItems: 'center',
  },
  slide: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  iconBubble: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  stepTitle: {
    fontSize: TYPOGRAPHY.subhead,
    fontWeight: '700',
    color: COLORS.text,
  },
  stepCopy: {
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
});

export default GuideScreen;
