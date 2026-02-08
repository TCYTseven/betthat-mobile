import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, RefreshControl } from 'react-native';
import { Screen, TopBar } from '../components/layout';
import { BetCard, EmptyState, SegmentedControl } from '../components/common';
import { COLORS, SPACING } from '../constants';
import { useBets } from '../context/BetContext';
import { getBetStatus } from '../utils/betMath';

const MyBetsScreen = ({ navigation }) => {
  const { bets } = useBets();
  const [tab, setTab] = useState('created');
  const [refreshing, setRefreshing] = useState(false);

  const { created, joined } = useMemo(() => {
    const createdList = bets.filter((bet) => bet.createdByMe && !bet.isExample);
    const joinedList = bets.filter(
      (bet) =>
        bet.participants.some((participant) => participant.isLocal) &&
        !bet.createdByMe
    );
    return { created: createdList, joined: joinedList };
  }, [bets]);

  const list = tab === 'created' ? created : joined;

  return (
    <Screen
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            setTimeout(() => setRefreshing(false), 600);
          }}
        />
      }
    >
      <TopBar title="My Bets" />
      <SegmentedControl
        options={[
          { label: 'Created', value: 'created' },
          { label: 'Joined', value: 'joined' },
        ]}
        value={tab}
        onChange={setTab}
      />
      <View style={styles.list}>
        {list.length === 0 ? (
          <EmptyState
            icon="flag"
            title={tab === 'created' ? 'No created bets' : 'No joined bets'}
            message={
              tab === 'created'
                ? 'Create a bet and share the link with friends.'
                : 'Join a shared bet to see it here.'
            }
            actionLabel={tab === 'created' ? 'Create a bet' : 'Open a bet'}
            onAction={() =>
              tab === 'created'
                ? navigation.navigate('Create')
                : navigation.navigate('Home')
            }
          />
        ) : (
          list.map((bet) => (
            <BetCard
              key={bet.id}
              bet={bet}
              status={getBetStatus(bet, Date.now())}
              onPress={() => navigation.navigate('BetDetail', { betId: bet.id })}
            />
          ))
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  list: {
    marginTop: SPACING.lg,
  },
});

export default MyBetsScreen;
