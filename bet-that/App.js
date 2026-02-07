import React, { useMemo, useState, useEffect, useContext } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Share,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';

enableScreens();

const Stack = createNativeStackNavigator();

const COLORS = {
  background: '#FFFFFF',
  surface: '#F6F8F6',
  primary: '#1B4332',
  primaryDark: '#0F2E21',
  text: '#0B1F17',
  muted: '#5B6B62',
  border: '#E1E8E3',
  warning: '#B07A00',
  success: '#2D6A4F',
  shadow: 'rgba(15, 46, 33, 0.08)',
};

const SPACING = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
};

const BET_LINK_BASE = 'https://betthat.app/bet/';
const CREATOR_LINK_BASE = 'https://betthat.app/creator/';
const SAMPLE_BET_ID = 'example-bet';

const BetContext = React.createContext(null);

const createId = (prefix) =>
  `${prefix}_${Math.random().toString(36).slice(2, 9)}`;

const pad = (value) => String(value).padStart(2, '0');

const formatDateTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return `${months[date.getMonth()]} ${date.getDate()} · ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
};

const formatAmount = (value) => {
  const safe = Number.isFinite(value) ? value : 0;
  return safe.toFixed(2);
};

const toInputDate = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const toInputTime = (date) =>
  `${pad(date.getHours())}:${pad(date.getMinutes())}`;

const parseDateTime = (dateStr, timeStr) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  if (!/^\d{2}:\d{2}$/.test(timeStr)) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);
  const date = new Date(year, month - 1, day, hour, minute, 0, 0);
  if (Number.isNaN(date.getTime())) return null;
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
};

const formatCountdown = (closeAt, now) => {
  const diffMs = new Date(closeAt).getTime() - now;
  if (!Number.isFinite(diffMs) || diffMs <= 0) return 'Betting closed';
  const totalMinutes = Math.max(0, Math.floor(diffMs / 60000));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) {
    return `${days}d ${hours}h left`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  }
  return `${minutes}m left`;
};

const sumValues = (values) =>
  values.reduce((total, value) => total + value, 0);

const getOutcomeTotals = (bet) => {
  const totals = {};
  bet.outcomes.forEach((outcome) => {
    totals[outcome.id] = 0;
  });
  bet.participants.forEach((participant) => {
    if (totals[participant.outcomeId] !== undefined) {
      totals[participant.outcomeId] += participant.amount;
    }
  });
  return totals;
};

const getBetStatus = (bet, now) => {
  if (bet.status === 'resolved') return 'resolved';
  if (bet.status === 'closed') return 'closed';
  if (new Date(bet.closeAt).getTime() <= now) return 'closed';
  return 'open';
};

const calculateResults = (bet) => {
  if (!bet.winningOutcomeId) return null;
  const totals = getOutcomeTotals(bet);
  const poolTotal = sumValues(Object.values(totals));
  const winners = bet.participants.filter(
    (participant) => participant.outcomeId === bet.winningOutcomeId
  );
  const losers = bet.participants.filter(
    (participant) => participant.outcomeId !== bet.winningOutcomeId
  );
  const totalWinStake = sumValues(winners.map((participant) => participant.amount));
  const totalLoserStake = poolTotal - totalWinStake;
  const winnersWithPayout = winners.map((participant) => {
    if (totalWinStake <= 0) {
      return {
        ...participant,
        payout: 0,
        net: 0,
      };
    }
    const payout = (participant.amount / totalWinStake) * poolTotal;
    return {
      ...participant,
      payout,
      net: payout - participant.amount,
    };
  });
  const settlement = [];
  if (totalLoserStake > 0 && winnersWithPayout.length > 0) {
    losers.forEach((loser) => {
      winnersWithPayout.forEach((winner) => {
        const amount = (loser.amount / totalLoserStake) * winner.net;
        if (amount > 0.004) {
          settlement.push({
            from: loser.name,
            to: winner.name,
            amount,
          });
        }
      });
    });
  }
  return {
    poolTotal,
    totals,
    winners: winnersWithPayout,
    losers,
    totalWinStake,
    totalLoserStake,
    settlement,
  };
};

const initialBets = [
  {
    id: SAMPLE_BET_ID,
    title: 'Will the hometown team win tonight?',
    description:
      'Friendly watch party bet. If the game is postponed, we roll to the next game.',
    closeAt: new Date(Date.now() + 1000 * 60 * 120).toISOString(),
    rules: 'If it goes to overtime, a win still counts as a win.',
    outcomes: [
      { id: 'yes', label: 'Yes, they win' },
      { id: 'no', label: 'No, they lose' },
      { id: 'tie', label: 'Tie or overtime' },
    ],
    creatorName: 'Maya',
    creatorId: 'creator_example',
    status: 'open',
    createdAt: new Date().toISOString(),
    createdByMe: false,
    isExample: true,
    participants: [
      {
        id: 'p1',
        name: 'Alex',
        outcomeId: 'yes',
        amount: 20,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'p2',
        name: 'Sam',
        outcomeId: 'no',
        amount: 15,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'p3',
        name: 'Priya',
        outcomeId: 'yes',
        amount: 10,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'p4',
        name: 'Jules',
        outcomeId: 'tie',
        amount: 8,
        createdAt: new Date().toISOString(),
      },
    ],
  },
];

const useNow = (intervalMs = 30000) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
};

const useBets = () => useContext(BetContext);

const BetProvider = ({ children }) => {
  const [bets, setBets] = useState(initialBets);

  const createBet = (payload) => {
    const betId = createId('bet');
    const creatorId = createId('creator');
    const newBet = {
      ...payload,
      id: betId,
      creatorId,
      status: 'open',
      createdAt: new Date().toISOString(),
      createdByMe: true,
      isExample: false,
      participants: [],
    };
    setBets((prev) => [newBet, ...prev]);
    return newBet;
  };

  const addWager = (betId, wager) => {
    setBets((prev) =>
      prev.map((bet) =>
        bet.id === betId
          ? { ...bet, participants: [...bet.participants, wager] }
          : bet
      )
    );
  };

  const closeBet = (betId) => {
    setBets((prev) =>
      prev.map((bet) =>
        bet.id === betId ? { ...bet, status: 'closed' } : bet
      )
    );
  };

  const resolveBet = (betId, winningOutcomeId) => {
    setBets((prev) =>
      prev.map((bet) =>
        bet.id === betId
          ? { ...bet, status: 'resolved', winningOutcomeId }
          : bet
      )
    );
  };

  return (
    <BetContext.Provider value={{ bets, createBet, addWager, closeBet, resolveBet }}>
      {children}
    </BetContext.Provider>
  );
};

const Screen = ({ children, style }) => (
  <SafeAreaView style={styles.safeArea}>
    <StatusBar style="dark" />
    <ScrollView
      contentContainerStyle={[styles.screen, style]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  </SafeAreaView>
);

const Card = ({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
);

const PrimaryButton = ({ label, onPress, disabled, style }) => (
  <Pressable
    onPress={disabled ? null : onPress}
    style={({ pressed }) => [
      styles.buttonPrimary,
      disabled && styles.buttonDisabled,
      pressed && !disabled && styles.buttonPressed,
      style,
    ]}
  >
    <Text style={styles.buttonPrimaryText}>{label}</Text>
  </Pressable>
);

const SecondaryButton = ({ label, onPress, style }) => (
  <Pressable onPress={onPress} style={[styles.buttonSecondary, style]}>
    <Text style={styles.buttonSecondaryText}>{label}</Text>
  </Pressable>
);

const GhostButton = ({ label, onPress, style }) => (
  <Pressable onPress={onPress} style={[styles.buttonGhost, style]}>
    <Text style={styles.buttonGhostText}>{label}</Text>
  </Pressable>
);

const Badge = ({ label, variant }) => (
  <View style={[styles.badge, variant === 'open' && styles.badgeOpen]}>
    <Text style={styles.badgeText}>{label}</Text>
  </View>
);

const shareLink = async (title, link) => {
  try {
    await Share.share({
      message: `${title}\n${link}`,
    });
  } catch (error) {
    // Share sheet failures are non-blocking.
  }
};

const OnboardingScreen = ({ navigation }) => (
  <SafeAreaView style={styles.safeArea}>
    <StatusBar style="dark" />
    <View style={styles.onboardingContainer}>
      <Text style={styles.brandTitle}>Bet That</Text>
      <Text style={styles.heroTitle}>
        Quick, friendly bets with zero friction.
      </Text>
      <Text style={styles.bodyText}>
        Create a bet, share a link, let friends join, and we handle the math.
        No accounts. No payments. Just clear outcomes and offline settlement.
      </Text>
      <View style={styles.bulletList}>
        <Text style={styles.bulletItem}>• Create a bet in under a minute</Text>
        <Text style={styles.bulletItem}>• Share the link anywhere</Text>
        <Text style={styles.bulletItem}>• See exactly who owes what</Text>
      </View>
      <PrimaryButton
        label="Create a bet"
        onPress={() => navigation.navigate('CreateBet')}
        style={styles.onboardingButton}
      />
      <SecondaryButton
        label="View example bet"
        onPress={() => navigation.navigate('Bet', { betId: SAMPLE_BET_ID })}
      />
      <GhostButton
        label="Go to dashboard"
        onPress={() => navigation.navigate('Home')}
        style={styles.onboardingGhost}
      />
    </View>
  </SafeAreaView>
);

const HomeScreen = ({ navigation }) => {
  const { bets } = useBets();
  const [betLink, setBetLink] = useState('');
  const [creatorLink, setCreatorLink] = useState('');
  const [linkError, setLinkError] = useState('');
  const now = useNow();

  const openBetLink = () => {
    const id = parseLinkId(betLink, 'bet');
    if (!id) {
      setLinkError('Paste a valid bet link to open it.');
      return;
    }
    setLinkError('');
    navigation.navigate('Bet', { betId: id });
  };

  const openCreatorLink = () => {
    const id = parseLinkId(creatorLink, 'creator');
    if (!id) {
      setLinkError('Paste a valid creator link to open it.');
      return;
    }
    setLinkError('');
    navigation.navigate('CreatorBet', { creatorId: id });
  };

  return (
    <Screen>
      <Text style={styles.screenTitle}>Dashboard</Text>
      <Text style={styles.bodyText}>
        Everything you create or join stays local on this device. Links make it
        easy to hop in from a group chat.
      </Text>
      <PrimaryButton
        label="Create a bet"
        onPress={() => navigation.navigate('CreateBet')}
        style={{ marginTop: SPACING.md }}
      />
      <Card style={{ marginTop: SPACING.lg }}>
        <Text style={styles.sectionTitle}>Open a bet link</Text>
        <TextInput
          style={styles.input}
          value={betLink}
          onChangeText={setBetLink}
          placeholder="Paste bet link"
          placeholderTextColor={COLORS.muted}
          autoCapitalize="none"
        />
        <PrimaryButton label="Open bet" onPress={openBetLink} />
      </Card>
      <Card style={{ marginTop: SPACING.md }}>
        <Text style={styles.sectionTitle}>Open a creator link</Text>
        <TextInput
          style={styles.input}
          value={creatorLink}
          onChangeText={setCreatorLink}
          placeholder="Paste creator link"
          placeholderTextColor={COLORS.muted}
          autoCapitalize="none"
        />
        <PrimaryButton label="Open creator view" onPress={openCreatorLink} />
        {linkError ? <Text style={styles.errorText}>{linkError}</Text> : null}
      </Card>
      <Text style={[styles.sectionTitle, { marginTop: SPACING.lg }]}>
        Bets on this device
      </Text>
      {bets.length === 0 ? (
        <Card>
          <Text style={styles.bodyText}>
            You do not have any bets yet. Create one to get started.
          </Text>
        </Card>
      ) : (
        bets.map((bet) => {
          const status = getBetStatus(bet, now);
          const participantsCount = bet.participants.length;
          return (
            <Card key={bet.id} style={{ marginBottom: SPACING.md }}>
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>{bet.title}</Text>
                <Badge
                  label={status === 'open' ? 'Open' : status === 'closed' ? 'Closed' : 'Resolved'}
                  variant={status}
                />
              </View>
              <Text style={styles.cardMeta}>
                Closes {formatDateTime(bet.closeAt)} · {participantsCount} joined
              </Text>
              {bet.isExample ? (
                <Text style={styles.helperText}>Example bet</Text>
              ) : null}
              <View style={styles.cardActions}>
                <SecondaryButton
                  label="Open bet"
                  onPress={() => navigation.navigate('Bet', { betId: bet.id })}
                />
                {bet.createdByMe ? (
                  <SecondaryButton
                    label="Creator view"
                    onPress={() =>
                      navigation.navigate('CreatorBet', { creatorId: bet.creatorId })
                    }
                  />
                ) : null}
              </View>
            </Card>
          );
        })
      )}
    </Screen>
  );
};

const CreateBetScreen = ({ navigation }) => {
  const { createBet } = useBets();
  const defaultClose = new Date(Date.now() + 1000 * 60 * 90);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [outcomes, setOutcomes] = useState(['', '']);
  const [closeDate, setCloseDate] = useState(toInputDate(defaultClose));
  const [closeTime, setCloseTime] = useState(toInputTime(defaultClose));
  const [error, setError] = useState('');

  const updateOutcome = (index, value) => {
    setOutcomes((prev) =>
      prev.map((item, idx) => (idx === index ? value : item))
    );
  };

  const removeOutcome = (index) => {
    if (outcomes.length <= 2) return;
    setOutcomes((prev) => prev.filter((_, idx) => idx !== index));
  };

  const addOutcome = () => {
    if (outcomes.length >= 6) return;
    setOutcomes((prev) => [...prev, '']);
  };

  const applyQuickClose = (minutes) => {
    const next = new Date(Date.now() + minutes * 60000);
    setCloseDate(toInputDate(next));
    setCloseTime(toInputTime(next));
  };

  const handleCreate = () => {
    const trimmedTitle = title.trim();
    const trimmedCreator = creatorName.trim();
    const validOutcomes = outcomes.map((item) => item.trim()).filter(Boolean);
    const closeAt = parseDateTime(closeDate, closeTime);
    if (trimmedTitle.length < 3) {
      setError('Add a clear event title.');
      return;
    }
    if (trimmedCreator.length < 2) {
      setError('Add your name or nickname.');
      return;
    }
    if (validOutcomes.length < 2 || validOutcomes.length > 6) {
      setError('Add between 2 and 6 outcomes.');
      return;
    }
    if (!closeAt || closeAt.getTime() <= Date.now() + 60000) {
      setError('Pick a close time in the future.');
      return;
    }
    setError('');
    const bet = createBet({
      title: trimmedTitle,
      description: description.trim(),
      rules: rules.trim(),
      closeAt: closeAt.toISOString(),
      outcomes: validOutcomes.map((label) => ({
        id: createId('outcome'),
        label,
      })),
      creatorName: trimmedCreator,
    });
    navigation.replace('CreateSuccess', { betId: bet.id });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}
    >
      <Screen>
        <Text style={styles.screenTitle}>Create a bet</Text>
        <Text style={styles.bodyText}>
          Keep it short and easy to understand. Bets close automatically at the
          time you set.
        </Text>
        <Text style={styles.inputLabel}>Event title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g., Will our team win tonight?"
          placeholderTextColor={COLORS.muted}
        />
        <Text style={styles.inputLabel}>Description (optional)</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          value={description}
          onChangeText={setDescription}
          placeholder="Add context or stakes"
          placeholderTextColor={COLORS.muted}
          multiline
        />
        <Text style={styles.inputLabel}>Close date</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.inputHalf]}
            value={closeDate}
            onChangeText={setCloseDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={COLORS.muted}
          />
          <TextInput
            style={[styles.input, styles.inputHalf]}
            value={closeTime}
            onChangeText={setCloseTime}
            placeholder="HH:MM"
            placeholderTextColor={COLORS.muted}
          />
        </View>
        <View style={styles.quickRow}>
          <GhostButton label="In 30m" onPress={() => applyQuickClose(30)} />
          <GhostButton label="In 2h" onPress={() => applyQuickClose(120)} />
          <GhostButton label="Tonight" onPress={() => applyQuickClose(360)} />
          <GhostButton label="Tomorrow" onPress={() => applyQuickClose(1440)} />
        </View>
        <Text style={styles.inputLabel}>Outcomes (2 to 6)</Text>
        {outcomes.map((value, index) => (
          <View key={`outcome-${index}`} style={styles.outcomeRow}>
            <TextInput
              style={[styles.input, styles.outcomeInput]}
              value={value}
              onChangeText={(text) => updateOutcome(index, text)}
              placeholder={`Outcome ${index + 1}`}
              placeholderTextColor={COLORS.muted}
            />
            {outcomes.length > 2 ? (
              <Pressable onPress={() => removeOutcome(index)}>
                <Text style={styles.removeText}>Remove</Text>
              </Pressable>
            ) : null}
          </View>
        ))}
        <SecondaryButton label="Add another outcome" onPress={addOutcome} />
        <Text style={styles.inputLabel}>Rules or notes (optional)</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          value={rules}
          onChangeText={setRules}
          placeholder="Clarify how this should be resolved"
          placeholderTextColor={COLORS.muted}
          multiline
        />
        <Text style={styles.inputLabel}>Your name or nickname</Text>
        <TextInput
          style={styles.input}
          value={creatorName}
          onChangeText={setCreatorName}
          placeholder="How should you appear?"
          placeholderTextColor={COLORS.muted}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <PrimaryButton label="Create bet" onPress={handleCreate} />
      </Screen>
    </KeyboardAvoidingView>
  );
};

const CreateSuccessScreen = ({ route, navigation }) => {
  const { bets } = useBets();
  const { betId } = route.params;
  const bet = bets.find((item) => item.id === betId);
  if (!bet) {
    return (
      <Screen>
        <Text style={styles.screenTitle}>Bet not found</Text>
        <Text style={styles.bodyText}>
          We could not find this bet. Head back to the dashboard.
        </Text>
        <PrimaryButton label="Go to dashboard" onPress={() => navigation.navigate('Home')} />
      </Screen>
    );
  }
  const betLink = `${BET_LINK_BASE}${bet.id}`;
  const creatorLink = `${CREATOR_LINK_BASE}${bet.creatorId}`;
  return (
    <Screen>
      <Text style={styles.screenTitle}>You are ready to share</Text>
      <Text style={styles.bodyText}>
        Send the event link to friends. Keep the creator link private so you
        can close or resolve the bet.
      </Text>
      <Card>
        <Text style={styles.sectionTitle}>Event link</Text>
        <Text style={styles.linkText}>{betLink}</Text>
        <PrimaryButton
          label="Share event link"
          onPress={() => shareLink(`Join the bet: ${bet.title}`, betLink)}
        />
      </Card>
      <Card style={{ marginTop: SPACING.md }}>
        <Text style={styles.sectionTitle}>Creator link</Text>
        <Text style={styles.linkText}>{creatorLink}</Text>
        <SecondaryButton
          label="Open creator view"
          onPress={() =>
            navigation.navigate('CreatorBet', { creatorId: bet.creatorId })
          }
        />
      </Card>
      <Card style={{ marginTop: SPACING.md }}>
        <Text style={styles.helperText}>
          Bet That never handles payments. Settle however your group prefers.
        </Text>
      </Card>
      <PrimaryButton
        label="Open the event page"
        onPress={() => navigation.navigate('Bet', { betId: bet.id })}
        style={{ marginTop: SPACING.md }}
      />
      <GhostButton label="Back to dashboard" onPress={() => navigation.navigate('Home')} />
    </Screen>
  );
};

const BetScreen = ({ route, navigation }) => {
  const { bets, addWager } = useBets();
  const { betId } = route.params;
  const bet = bets.find((item) => item.id === betId);
  const now = useNow(15000);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedOutcome, setSelectedOutcome] = useState(null);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(null);

  if (!bet) {
    return (
      <Screen>
        <Text style={styles.screenTitle}>Bet not found</Text>
        <Text style={styles.bodyText}>
          This link does not match a bet on this device. In a full release, the
          bet would load from the server.
        </Text>
        <PrimaryButton label="Back to dashboard" onPress={() => navigation.navigate('Home')} />
      </Screen>
    );
  }

  const status = getBetStatus(bet, now);
  const totals = getOutcomeTotals(bet);
  const poolTotal = sumValues(Object.values(totals));
  const participantsCount = bet.participants.length;
  const selectedTotal = selectedOutcome ? totals[selectedOutcome] || 0 : 0;
  const parsedAmount = parseFloat(amount);
  const projectedPool = Number.isFinite(parsedAmount) ? poolTotal + parsedAmount : poolTotal;
  const projectedOutcomeTotal =
    Number.isFinite(parsedAmount) && selectedOutcome
      ? selectedTotal + parsedAmount
      : selectedTotal;
  const projectedPayout =
    Number.isFinite(parsedAmount) && projectedOutcomeTotal > 0
      ? (parsedAmount / projectedOutcomeTotal) * projectedPool
      : null;

  const handleJoin = () => {
    const trimmedName = name.trim();
    const amountValue = parseFloat(amount);
    if (status !== 'open') {
      setError('Betting is closed.');
      return;
    }
    if (!trimmedName) {
      setError('Add your name or nickname.');
      return;
    }
    if (!selectedOutcome) {
      setError('Pick an outcome.');
      return;
    }
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setError('Enter a valid amount.');
      return;
    }
    const wager = {
      id: createId('p'),
      name: trimmedName,
      outcomeId: selectedOutcome,
      amount: amountValue,
      createdAt: new Date().toISOString(),
    };
    addWager(bet.id, wager);
    setSubmitted(wager);
    setError('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}
    >
      <Screen>
        <View style={styles.rowBetween}>
          <Text style={styles.screenTitle}>{bet.title}</Text>
          <Badge
            label={status === 'open' ? 'Open' : status === 'closed' ? 'Closed' : 'Resolved'}
            variant={status}
          />
        </View>
        {bet.description ? (
          <Text style={styles.bodyText}>{bet.description}</Text>
        ) : null}
        <Card>
          <Text style={styles.sectionTitle}>Time left</Text>
          <Text style={styles.countdownText}>{formatCountdown(bet.closeAt, now)}</Text>
          <Text style={styles.helperText}>Closes {formatDateTime(bet.closeAt)}</Text>
        </Card>
        {status === 'resolved' ? (
          <Card style={{ marginTop: SPACING.md }}>
            <Text style={styles.sectionTitle}>This bet is resolved</Text>
            <Text style={styles.bodyText}>
              The outcome has been finalized. View the results to see the settlement.
            </Text>
            <PrimaryButton
              label="View results"
              onPress={() => navigation.navigate('Results', { betId: bet.id })}
            />
          </Card>
        ) : status === 'closed' ? (
          <Card style={{ marginTop: SPACING.md }}>
            <Text style={styles.sectionTitle}>Betting is closed</Text>
            <Text style={styles.bodyText}>
              Waiting on the creator to resolve the outcome.
            </Text>
          </Card>
        ) : null}
        {bet.rules ? (
          <Card style={{ marginTop: SPACING.md }}>
            <Text style={styles.sectionTitle}>Rules</Text>
            <Text style={styles.bodyText}>{bet.rules}</Text>
          </Card>
        ) : null}
        <Text style={[styles.sectionTitle, { marginTop: SPACING.lg }]}>
          Pick an outcome
        </Text>
        {bet.outcomes.map((outcome) => {
          const outcomeTotal = totals[outcome.id] || 0;
          const multiplier =
            outcomeTotal > 0 ? poolTotal / outcomeTotal : null;
          return (
            <Pressable
              key={outcome.id}
              onPress={() => setSelectedOutcome(outcome.id)}
              style={[
                styles.outcomeCard,
                selectedOutcome === outcome.id && styles.outcomeCardSelected,
              ]}
            >
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>{outcome.label}</Text>
                <Text style={styles.cardMeta}>
                  {formatAmount(outcomeTotal)} total
                </Text>
              </View>
              <Text style={styles.helperText}>
                {multiplier
                  ? `Return per 1.00 = ${formatAmount(multiplier)}`
                  : 'No wagers yet'}
              </Text>
            </Pressable>
          );
        })}
        <Card style={{ marginTop: SPACING.lg }}>
          <Text style={styles.sectionTitle}>Join this bet</Text>
          {status !== 'open' ? (
            <Text style={styles.helperText}>
              Betting is closed. You can still view the pool breakdown below.
            </Text>
          ) : null}
          {submitted ? (
            <View>
              <Text style={styles.confirmTitle}>Locked in</Text>
              <Text style={styles.bodyText}>
                {submitted.name} · {formatAmount(submitted.amount)} on{' '}
                {
                  bet.outcomes.find((item) => item.id === submitted.outcomeId)
                    ?.label
                }
              </Text>
              <Text style={styles.helperText}>
                Your entry is locked. Names can repeat and still count separately.
              </Text>
            </View>
          ) : (
            <View>
              <Text style={styles.inputLabel}>Your name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Name or nickname"
                placeholderTextColor={COLORS.muted}
              />
              <Text style={styles.inputLabel}>Amount (any unit)</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="e.g., 10"
                placeholderTextColor={COLORS.muted}
                keyboardType="numeric"
              />
              {projectedPayout && selectedOutcome ? (
                <Text style={styles.helperText}>
                  Potential return if {bet.outcomes.find((item) => item.id === selectedOutcome)?.label}{' '}
                  wins: {formatAmount(projectedPayout)}
                </Text>
              ) : (
                <Text style={styles.helperText}>
                  Names can repeat. Your amount is locked after you submit.
                </Text>
              )}
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <PrimaryButton
                label="Lock in my wager"
                onPress={handleJoin}
                disabled={status !== 'open'}
              />
            </View>
          )}
        </Card>
        <Card style={{ marginTop: SPACING.lg }}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Pool breakdown</Text>
            <Text style={styles.cardMeta}>{participantsCount} joined</Text>
          </View>
          <Text style={styles.poolTotalText}>
            Total pool: {formatAmount(poolTotal)}
          </Text>
          {bet.outcomes.map((outcome) => (
            <View key={outcome.id} style={styles.breakdownRow}>
              <Text style={styles.bodyText}>{outcome.label}</Text>
              <Text style={styles.cardMeta}>
                {formatAmount(totals[outcome.id] || 0)}
              </Text>
            </View>
          ))}
        </Card>
        <Card style={{ marginTop: SPACING.md }}>
          <Text style={styles.sectionTitle}>Share this bet</Text>
          <Text style={styles.linkText}>{BET_LINK_BASE + bet.id}</Text>
          <SecondaryButton
            label="Share link"
            onPress={() => shareLink(`Join the bet: ${bet.title}`, BET_LINK_BASE + bet.id)}
          />
        </Card>
      </Screen>
    </KeyboardAvoidingView>
  );
};

const CreatorBetScreen = ({ route, navigation }) => {
  const { bets, closeBet } = useBets();
  const now = useNow();
  const { creatorId } = route.params;
  const bet = bets.find((item) => item.creatorId === creatorId);

  if (!bet) {
    return (
      <Screen>
        <Text style={styles.screenTitle}>Creator link not found</Text>
        <Text style={styles.bodyText}>
          This creator link does not match a bet on this device. In a full
          release, the bet would load from the server.
        </Text>
        <PrimaryButton label="Back to dashboard" onPress={() => navigation.navigate('Home')} />
      </Screen>
    );
  }

  const status = getBetStatus(bet, now);
  const betLink = `${BET_LINK_BASE}${bet.id}`;
  const creatorLink = `${CREATOR_LINK_BASE}${bet.creatorId}`;
  const canResolve = status === 'closed';
  const canClose = status === 'open';

  return (
    <Screen>
      <Text style={styles.screenTitle}>{bet.title}</Text>
      <Text style={styles.bodyText}>
        Creator tools let you close betting early or resolve the outcome when the
        event is over.
      </Text>
      <Card>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Status</Text>
          <Badge
            label={status === 'open' ? 'Open' : status === 'closed' ? 'Closed' : 'Resolved'}
            variant={status}
          />
        </View>
        <Text style={styles.cardMeta}>
          Closes {formatDateTime(bet.closeAt)} · {bet.participants.length} joined
        </Text>
      </Card>
      <Card style={{ marginTop: SPACING.md }}>
        <Text style={styles.sectionTitle}>Event link</Text>
        <Text style={styles.linkText}>{betLink}</Text>
        <SecondaryButton label="Share event link" onPress={() => shareLink(bet.title, betLink)} />
      </Card>
      <Card style={{ marginTop: SPACING.md }}>
        <Text style={styles.sectionTitle}>Creator link</Text>
        <Text style={styles.linkText}>{creatorLink}</Text>
        <Text style={styles.helperText}>
          Keep this private. Anyone with it can resolve the bet.
        </Text>
      </Card>
      {canClose ? (
        <PrimaryButton
          label="Close betting now"
          onPress={() => closeBet(bet.id)}
          style={{ marginTop: SPACING.md }}
        />
      ) : null}
      {status === 'resolved' ? (
        <PrimaryButton
          label="View results"
          onPress={() => navigation.navigate('Results', { betId: bet.id })}
          style={{ marginTop: SPACING.md }}
        />
      ) : (
        <PrimaryButton
          label="Resolve outcome"
          onPress={() => navigation.navigate('ResolveBet', { betId: bet.id })}
          style={{ marginTop: SPACING.md }}
          disabled={!canResolve}
        />
      )}
      {!canResolve && status === 'open' ? (
        <Text style={styles.helperText}>
          Close betting first, then resolve the outcome.
        </Text>
      ) : null}
      <GhostButton
        label="Back to dashboard"
        onPress={() => navigation.navigate('Home')}
        style={{ marginTop: SPACING.md }}
      />
    </Screen>
  );
};

const ResolveBetScreen = ({ route, navigation }) => {
  const { bets, resolveBet } = useBets();
  const { betId } = route.params;
  const bet = bets.find((item) => item.id === betId);
  const [selected, setSelected] = useState(null);

  if (!bet) {
    return (
      <Screen>
        <Text style={styles.screenTitle}>Bet not found</Text>
        <PrimaryButton label="Back to dashboard" onPress={() => navigation.navigate('Home')} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.screenTitle}>Resolve outcome</Text>
      <Text style={styles.bodyText}>
        Select the winning outcome. This locks the bet and calculates results.
      </Text>
      {bet.outcomes.map((outcome) => (
        <Pressable
          key={outcome.id}
          onPress={() => setSelected(outcome.id)}
          style={[
            styles.outcomeCard,
            selected === outcome.id && styles.outcomeCardSelected,
          ]}
        >
          <Text style={styles.cardTitle}>{outcome.label}</Text>
        </Pressable>
      ))}
      <Text style={styles.helperText}>
        This cannot be undone. Everyone will see the final results.
      </Text>
      <PrimaryButton
        label="Confirm winning outcome"
        onPress={() => {
          resolveBet(bet.id, selected);
          navigation.replace('Results', { betId: bet.id });
        }}
        disabled={!selected}
        style={{ marginTop: SPACING.md }}
      />
    </Screen>
  );
};

const ResultsScreen = ({ route, navigation }) => {
  const { bets } = useBets();
  const { betId } = route.params;
  const bet = bets.find((item) => item.id === betId);
  const results = bet ? calculateResults(bet) : null;

  if (!bet) {
    return (
      <Screen>
        <Text style={styles.screenTitle}>Results not available</Text>
        <PrimaryButton label="Back to dashboard" onPress={() => navigation.navigate('Home')} />
      </Screen>
    );
  }

  if (!bet.winningOutcomeId) {
    return (
      <Screen>
        <Text style={styles.screenTitle}>Bet not resolved yet</Text>
        <Text style={styles.bodyText}>
          The creator still needs to pick a winning outcome.
        </Text>
        <PrimaryButton
          label="Back to creator view"
          onPress={() => navigation.navigate('CreatorBet', { creatorId: bet.creatorId })}
        />
      </Screen>
    );
  }

  const winningOutcome = bet.outcomes.find(
    (outcome) => outcome.id === bet.winningOutcomeId
  );

  return (
    <Screen>
      <Text style={styles.screenTitle}>Final results</Text>
      <Text style={styles.bodyText}>
        Winning outcome: {winningOutcome ? winningOutcome.label : 'Unknown'}
      </Text>
      <Card>
        <Text style={styles.sectionTitle}>Pool totals</Text>
        <Text style={styles.poolTotalText}>
          Total pool: {formatAmount(results.poolTotal)}
        </Text>
        <Text style={styles.helperText}>
          Winning side: {formatAmount(results.totalWinStake)} · Losing side:{' '}
          {formatAmount(results.totalLoserStake)}
        </Text>
      </Card>
      {results.winners.length === 0 ? (
        <Card style={{ marginTop: SPACING.md }}>
          <Text style={styles.sectionTitle}>No winners this time</Text>
          <Text style={styles.bodyText}>
            No one picked the winning outcome. Nothing is owed.
          </Text>
        </Card>
      ) : (
        <>
          <Card style={{ marginTop: SPACING.md }}>
            <Text style={styles.sectionTitle}>Winners</Text>
            {results.winners.map((winner) => (
              <View key={winner.id} style={styles.breakdownRow}>
                <Text style={styles.bodyText}>{winner.name}</Text>
                <Text style={styles.cardMeta}>
                  Receives {formatAmount(winner.payout)}
                </Text>
              </View>
            ))}
          </Card>
          <Card style={{ marginTop: SPACING.md }}>
            <Text style={styles.sectionTitle}>Who owes what</Text>
            {results.settlement.length === 0 ? (
              <Text style={styles.bodyText}>
                Everyone picked the winning outcome. Nothing is owed.
              </Text>
            ) : (
              results.settlement.map((item, index) => (
                <Text key={`${item.from}-${item.to}-${index}`} style={styles.bodyText}>
                  {item.from} owes {item.to} {formatAmount(item.amount)}
                </Text>
              ))
            )}
            <Text style={styles.helperText}>
              Settlement happens offline. Bet That never handles payments.
            </Text>
          </Card>
        </>
      )}
      <GhostButton
        label="Back to dashboard"
        onPress={() => navigation.navigate('Home')}
        style={{ marginTop: SPACING.md }}
      />
    </Screen>
  );
};

const parseLinkId = (value, type) => {
  if (!value) return null;
  const normalized = value.trim().replace(/\s/g, '');
  if (type === 'bet' && normalized.includes('/bet/')) {
    return normalized.split('/bet/').pop();
  }
  if (type === 'creator' && normalized.includes('/creator/')) {
    return normalized.split('/creator/').pop();
  }
  return normalized.length > 4 ? normalized : null;
};

export default function App() {
  return (
    <SafeAreaProvider>
      <BetProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Onboarding"
            screenOptions={{
              headerShadowVisible: false,
              headerTitleStyle: { color: COLORS.text },
              headerTintColor: COLORS.primary,
            }}
          >
            <Stack.Screen
              name="Onboarding"
              component={OnboardingScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Bet That' }} />
            <Stack.Screen name="CreateBet" component={CreateBetScreen} options={{ title: 'Create' }} />
            <Stack.Screen
              name="CreateSuccess"
              component={CreateSuccessScreen}
              options={{ title: 'Share' }}
            />
            <Stack.Screen name="Bet" component={BetScreen} options={{ title: 'Event' }} />
            <Stack.Screen
              name="CreatorBet"
              component={CreatorBetScreen}
              options={{ title: 'Creator' }}
            />
            <Stack.Screen
              name="ResolveBet"
              component={ResolveBetScreen}
              options={{ title: 'Resolve' }}
            />
            <Stack.Screen
              name="Results"
              component={ResultsScreen}
              options={{ title: 'Results' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </BetProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screen: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  bodyText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 22,
  },
  helperText: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: SPACING.xs,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  cardMeta: {
    fontSize: 14,
    color: COLORS.muted,
  },
  cardActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  buttonPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonSecondary: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  buttonSecondaryText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  buttonGhost: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonGhostText: {
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: COLORS.border,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  badgeOpen: {
    backgroundColor: 'rgba(45, 106, 79, 0.12)',
  },
  badgeText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '600',
  },
  onboardingContainer: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  bulletList: {
    marginVertical: SPACING.md,
  },
  bulletItem: {
    fontSize: 15,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  onboardingButton: {
    marginTop: SPACING.md,
  },
  onboardingGhost: {
    marginTop: SPACING.md,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: SPACING.sm,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: '#FFFFFF',
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputHalf: {
    flex: 1,
  },
  outcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  outcomeInput: {
    flex: 1,
  },
  removeText: {
    color: COLORS.warning,
    fontWeight: '600',
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  errorText: {
    color: '#B03A2E',
    fontSize: 14,
    marginTop: SPACING.sm,
  },
  linkText: {
    fontSize: 14,
    color: COLORS.primaryDark,
    marginBottom: SPACING.sm,
  },
  countdownText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
  outcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  outcomeCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(27, 67, 50, 0.06)',
  },
  confirmTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.success,
    marginBottom: SPACING.xs,
  },
  poolTotalText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: SPACING.sm,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
});
