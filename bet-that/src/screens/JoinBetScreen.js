import React, { useMemo, useState } from 'react';
import { Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Screen } from '../components/layout';
import { Button, Card, Input, OutcomeCard, StepIndicator } from '../components/common';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants';
import { useBets } from '../context/BetContext';
import { getBetStatus, getOutcomeTotals, sumValues } from '../utils/betMath';
import { formatAmount } from '../utils/formatters';
import { createId } from '../utils/id';

const JoinBetScreen = ({ route, navigation }) => {
  const { betId, outcomeId } = route.params;
  const { bets, addWager } = useBets();
  const bet = bets.find((item) => item.id === betId);
  const [step, setStep] = useState(outcomeId ? 1 : 0);
  const [selectedOutcome, setSelectedOutcome] = useState(outcomeId || null);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  if (!bet) {
    return (
      <Screen>
        <Text style={styles.title}>Bet not found</Text>
      </Screen>
    );
  }

  const status = getBetStatus(bet, Date.now());
  const totals = getOutcomeTotals(bet);
  const poolTotal = sumValues(Object.values(totals));
  const parsedAmount = parseFloat(amount);
  const selectedTotal = selectedOutcome ? totals[selectedOutcome] || 0 : 0;
  const projectedPool = Number.isFinite(parsedAmount) ? poolTotal + parsedAmount : poolTotal;
  const projectedOutcomeTotal =
    Number.isFinite(parsedAmount) && selectedOutcome
      ? selectedTotal + parsedAmount
      : selectedTotal;
  const projectedPayout =
    Number.isFinite(parsedAmount) && projectedOutcomeTotal > 0
      ? (parsedAmount / projectedOutcomeTotal) * projectedPool
      : null;

  const steps = ['Outcome', 'Details', 'Review'];

  const outcomesWithShare = useMemo(() => {
    return bet.outcomes.map((outcome) => {
      const total = totals[outcome.id] || 0;
      const share = poolTotal > 0 ? total / poolTotal : 0;
      return { ...outcome, total, share };
    });
  }, [bet.outcomes, totals, poolTotal]);

  const validateStep = () => {
    if (status !== 'open') {
      setError('Betting is closed.');
      return false;
    }
    if (step === 0 && !selectedOutcome) {
      setError('Pick an outcome.');
      return false;
    }
    if (step === 1) {
      if (!name.trim()) {
        setError('Add your name or nickname.');
        return false;
      }
      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        setError('Enter a valid amount.');
        return false;
      }
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < steps.length - 1) {
      setStep(step + 1);
    }
  };

  const handleConfirm = () => {
    if (!validateStep()) return;
    const wager = {
      id: createId('p'),
      name: name.trim(),
      outcomeId: selectedOutcome,
      amount: parsedAmount,
      createdAt: new Date().toISOString(),
    };
    addWager(bet.id, wager);
    navigation.replace('BetDetail', { betId: bet.id });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}
    >
      <Screen>
        <Text style={styles.title}>Join this bet</Text>
        <StepIndicator current={step} total={steps.length} />

        {status !== 'open' ? (
          <Card>
            <Text style={styles.sectionTitle}>Betting is closed</Text>
            <Text style={styles.helper}>You can still review the bet details.</Text>
            <Button
              label="Back to bet"
              variant="secondary"
              onPress={() => navigation.goBack()}
            />
          </Card>
        ) : null}

        {status === 'open' && step === 0 ? (
          <Card>
            <Text style={styles.sectionTitle}>Pick an outcome</Text>
            {outcomesWithShare.map((outcome) => (
              <OutcomeCard
                key={outcome.id}
                label={outcome.label}
                total={outcome.total}
                share={outcome.share}
                selected={selectedOutcome === outcome.id}
                onPress={() => setSelectedOutcome(outcome.id)}
                showShare={poolTotal > 0}
              />
            ))}
          </Card>
        ) : null}

        {status === 'open' && step === 1 ? (
          <Card>
            <Text style={styles.sectionTitle}>Your details</Text>
            <Input
              label="Your name"
              value={name}
              onChangeText={setName}
              placeholder="Name or nickname"
            />
            <Input
              label="Amount (any unit)"
              value={amount}
              onChangeText={setAmount}
              placeholder="e.g., 10"
              keyboardType="numeric"
            />
            {projectedPayout ? (
              <Text style={styles.helper}>
                Potential return: {formatAmount(projectedPayout)}
              </Text>
            ) : null}
          </Card>
        ) : null}

        {status === 'open' && step === 2 ? (
          <Card>
            <Text style={styles.sectionTitle}>Review</Text>
            <Text style={styles.helper}>Confirm your pick before locking in.</Text>
            <Text style={styles.reviewItem}>
              {name.trim()} · {formatAmount(parsedAmount)} on{' '}
              {bet.outcomes.find((item) => item.id === selectedOutcome)?.label}
            </Text>
            <Text style={styles.helper}>
              Your entry is locked after submission.
            </Text>
          </Card>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {status === 'open' ? (
          <Card style={styles.footer}>
            {step > 0 ? (
              <Button label="Back" variant="ghost" onPress={() => setStep(step - 1)} />
            ) : null}
            {step < steps.length - 1 ? (
              <Button label="Next" icon="arrow-right" onPress={handleNext} />
            ) : (
              <Button label="Lock in wager" icon="lock" onPress={handleConfirm} />
            )}
          </Card>
        ) : null}
      </Screen>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  title: {
    fontSize: TYPOGRAPHY.headline,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.subhead,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  helper: {
    color: COLORS.muted,
    marginTop: SPACING.sm,
  },
  reviewItem: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  error: {
    color: COLORS.danger,
    fontWeight: '600',
    marginTop: SPACING.sm,
  },
  footer: {
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
});

export default JoinBetScreen;
