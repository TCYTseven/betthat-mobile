import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
} from 'react-native';
import Slider from '@react-native-community/slider';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import { Screen, TopBar } from '../components/layout';
import { Button, Card, Input, StepIndicator } from '../components/common';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants';
import { createId } from '../utils/id';
import { formatDateTime } from '../utils/formatters';
import { useBets } from '../context/BetContext';
import { useOnboarding } from '../context/OnboardingContext';

const MAX_OUTCOMES = 6;
const MIN_OUTCOMES = 2;

const CreateBetWizard = ({ navigation }) => {
  const { createBet } = useBets();
  const { userName } = useOnboarding();
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState('');
  const [outcomes, setOutcomes] = useState([
    { id: createId('outcome'), label: '' },
    { id: createId('outcome'), label: '' },
  ]);
  const [closeAt, setCloseAt] = useState(new Date(Date.now() + 24 * 60 * 60000));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [maxParticipants, setMaxParticipants] = useState('');
  const [customOdds, setCustomOdds] = useState({ 0: { value: 110, isPositive: false }, 1: { value: 110, isPositive: false } });
  const [useCustomOdds, setUseCustomOdds] = useState(true);
  const [error, setError] = useState('');

  const steps = ['Event', 'Outcomes', 'Timing', 'Odds', 'Limit', 'Review'];

  const validOutcomes = outcomes.map((item) => item.label.trim()).filter(Boolean);

  const closeAtDisplay = useMemo(() => {
    return {
      date: closeAt.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      time: closeAt.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  }, [closeAt]);

  const validateStep = () => {
    if (step === 0) {
      if (title.trim().length < 3) {
        setError('Need at least 3 characters for the event.');
        return false;
      }
    }
    if (step === 1) {
      if (validOutcomes.length < MIN_OUTCOMES) {
        setError('Need at least 2 possible outcomes.');
        return false;
      }
    }
    if (step === 2) {
      if (closeAt.getTime() <= Date.now() + 60000) {
        setError('Betting needs to close sometime in the future!');
        return false;
      }
    }
    if (step === 4) {
      const maxPart = parseInt(maxParticipants, 10);
      if (maxParticipants && (!Number.isFinite(maxPart) || maxPart < 2)) {
        setError('If setting a limit, need at least 2 people.');
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

  const handleCreate = () => {
    if (!validateStep()) return;
    if (validOutcomes.length > MAX_OUTCOMES) {
      setError('Too many outcomes! Keep it to 6 max.');
      return;
    }
    const bet = createBet({
      title: title.trim(),
      closeAt: closeAt.toISOString(),
      outcomes: validOutcomes.map((label, idx) => {
        let odds = 1;
        if (useCustomOdds && customOdds[idx]) {
          odds = americanToDecimal(customOdds[idx].value, customOdds[idx].isPositive);
        }
        return {
          id: createId('outcome'),
          label,
          odds,
        };
      }),
      creatorName: userName || 'Anonymous',
      maxParticipants: maxParticipants ? parseInt(maxParticipants, 10) : null,
    });
    navigation.navigate('CreateSuccess', { betId: bet.id });
  };

  const addOutcome = () => {
    if (outcomes.length >= MAX_OUTCOMES) return;
    setOutcomes((prev) => [...prev, { id: createId('outcome'), label: '' }]);
    
    // Add default odds for new outcome
    if (useCustomOdds) {
      const newOdds = { ...customOdds };
      newOdds[outcomes.length] = { value: 110, isPositive: false };
      setCustomOdds(newOdds);
    }
  };

  const removeOutcome = (id) => {
    if (outcomes.length <= MIN_OUTCOMES) return;
    const removedIndex = outcomes.findIndex((item) => item.id === id);
    setOutcomes((prev) => prev.filter((item) => item.id !== id));
    
    // Shift odds indices down after removal
    if (useCustomOdds && removedIndex !== -1) {
      const newOdds = {};
      let newIdx = 0;
      for (let i = 0; i < outcomes.length; i++) {
        if (i !== removedIndex && customOdds[i]) {
          newOdds[newIdx] = customOdds[i];
          newIdx++;
        }
      }
      setCustomOdds(newOdds);
    }
  };

  // Convert American odds to decimal multiplier
  const americanToDecimal = (americanOdds, isPositive) => {
    if (isPositive) {
      // Positive odds: +150 means bet $100 to win $150 (get back $250)
      return (americanOdds + 100) / 100;
    } else {
      // Negative odds: -110 means bet $110 to win $100 (get back $210)
      return (americanOdds + 100) / americanOdds;
    }
  };

  // Convert American odds to implied probability
  const americanToImpliedProb = (americanOdds, isPositive) => {
    if (isPositive) {
      return 100 / (americanOdds + 100);
    } else {
      return americanOdds / (americanOdds + 100);
    }
  };

  // Convert implied probability back to American odds
  const impliedProbToAmerican = (prob) => {
    if (prob >= 0.5) {
      // Favorite: use negative odds
      const odds = Math.round((prob * 100) / (1 - prob));
      return { value: odds, isPositive: false };
    } else {
      // Underdog: use positive odds
      const odds = Math.round(((1 - prob) * 100) / prob);
      return { value: odds, isPositive: true };
    }
  };

  const handleOddsChange = (idx, newValue, isPositive) => {
    const newOdds = { ...customOdds };
    newOdds[idx] = { value: newValue, isPositive };
    setCustomOdds(newOdds);
  };

  const toggleOddsSign = (idx) => {
    const newOdds = { ...customOdds };
    if (newOdds[idx]) {
      newOdds[idx] = { ...newOdds[idx], isPositive: !newOdds[idx].isPositive };
      setCustomOdds(newOdds);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}
    >
      <Screen>
        <TopBar title="Create Bet" />
        <StepIndicator current={step} total={steps.length} />
        
        {step === 0 ? (
          <View style={styles.section}>
            <Text style={styles.stepLabel}>Event Title</Text>
            <View style={styles.inputContainer}>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="What's the bet?"
                placeholderTextColor={COLORS.muted}
                style={styles.titleInput}
                maxLength={80}
                autoFocus
                multiline
              />
            </View>
          </View>
        ) : null}

        {step === 1 ? (
          <View style={styles.section}>
            <Text style={styles.stepLabel}>Possible Outcomes</Text>
            {outcomes.map((item, index) => (
              <View key={item.id} style={styles.outcomeRow}>
                <TextInput
                  value={item.label}
                  onChangeText={(text) =>
                    setOutcomes((prev) =>
                      prev.map((outcome) =>
                        outcome.id === item.id ? { ...outcome, label: text } : outcome
                      )
                    )
                  }
                  placeholder={`Outcome ${index + 1}`}
                  placeholderTextColor={COLORS.muted}
                  style={styles.outcomeInput}
                />
                {outcomes.length > MIN_OUTCOMES && (
                  <Pressable
                    onPress={() => removeOutcome(item.id)}
                    hitSlop={10}
                    accessibilityRole="button"
                  >
                    <Feather name="x" size={20} color={COLORS.muted} />
                  </Pressable>
                )}
              </View>
            ))}
            {outcomes.length < MAX_OUTCOMES && (
              <Pressable
                onPress={addOutcome}
                style={styles.addButton}
                accessibilityRole="button"
              >
                <Feather name="plus" size={18} color={COLORS.primary} />
                <Text style={styles.addButtonText}>Add Outcome</Text>
              </Pressable>
            )}
          </View>
        ) : null}

        {step === 2 ? (
          <View style={styles.section}>
            <Text style={styles.stepLabel}>Betting Closes</Text>
            <View style={styles.timeRow}>
              <Pressable
                onPress={() => setShowDatePicker(true)}
                style={styles.timeCard}
                accessibilityRole="button"
              >
                <Text style={styles.timeLabel}>Date</Text>
                <Text style={styles.timeValue}>{closeAtDisplay.date}</Text>
              </Pressable>
              <Pressable
                onPress={() => setShowTimePicker(true)}
                style={styles.timeCard}
                accessibilityRole="button"
              >
                <Text style={styles.timeLabel}>Time</Text>
                <Text style={styles.timeValue}>{closeAtDisplay.time}</Text>
              </Pressable>
            </View>
            {showDatePicker ? (
              <DateTimePicker
                value={closeAt}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onChange={(_, date) => {
                  setShowDatePicker(false);
                  if (date) {
                    const updated = new Date(closeAt);
                    updated.setFullYear(date.getFullYear());
                    updated.setMonth(date.getMonth());
                    updated.setDate(date.getDate());
                    setCloseAt(updated);
                  }
                }}
              />
            ) : null}
            {showTimePicker ? (
              <DateTimePicker
                value={closeAt}
                mode="time"
                display="default"
                onChange={(_, date) => {
                  setShowTimePicker(false);
                  if (date) {
                    const updated = new Date(closeAt);
                    updated.setHours(date.getHours());
                    updated.setMinutes(date.getMinutes());
                    setCloseAt(updated);
                  }
                }}
              />
            ) : null}
          </View>
        ) : null}

        {step === 3 ? (
          <View style={styles.section}>
            <Text style={styles.stepLabel}>Custom Odds</Text>
            
            <View style={styles.settingGroup}>
              <View style={styles.settingRow}>
                <Text style={styles.settingTitle}>Enable Custom Odds</Text>
                <Pressable
                  onPress={() => setUseCustomOdds(!useCustomOdds)}
                  accessibilityRole="button"
                >
                  <Feather
                    name={useCustomOdds ? 'toggle-right' : 'toggle-left'}
                    size={32}
                    color={useCustomOdds ? COLORS.primary : COLORS.muted}
                  />
                </Pressable>
              </View>
              
              {useCustomOdds && (
                <View style={styles.oddsContainer}>
                  {validOutcomes.map((outcome, idx) => {
                    const oddsData = customOdds[idx] || { value: 110, isPositive: false };
                    const decimal = americanToDecimal(oddsData.value, oddsData.isPositive);
                    const impliedProb = americanToImpliedProb(oddsData.value, oddsData.isPositive);
                    
                    return (
                      <View key={idx} style={styles.oddsRow}>
                        <View style={styles.oddsHeader}>
                          <Text style={styles.oddsOutcome}>{outcome}</Text>
                          <View style={styles.oddsDisplay}>
                            <Pressable
                              onPress={() => toggleOddsSign(idx)}
                              style={styles.oddsToggle}
                            >
                              <Text style={styles.oddsSign}>
                                {oddsData.isPositive ? '+' : '-'}
                              </Text>
                            </Pressable>
                            <Text style={styles.oddsValue}>{oddsData.value}</Text>
                            <Text style={styles.oddsMultiplier}>({decimal.toFixed(2)}×)</Text>
                          </View>
                        </View>
                        <Slider
                          style={styles.oddsSlider}
                          minimumValue={100}
                          maximumValue={500}
                          step={5}
                          value={oddsData.value}
                          onValueChange={(value) => handleOddsChange(idx, Math.round(value), oddsData.isPositive)}
                          minimumTrackTintColor={COLORS.primary}
                          maximumTrackTintColor={COLORS.border}
                          thumbTintColor={COLORS.primary}
                        />
                        <Text style={styles.impliedProb}>
                          {(impliedProb * 100).toFixed(1)}% implied probability
                        </Text>
                      </View>
                    );
                  })}
                  <View style={styles.oddsInfo}>
                    <Feather name="info" size={14} color={COLORS.muted} />
                    <Text style={styles.oddsInfoText}>
                      {`Total: ${(validOutcomes.reduce((sum, _, i) => {
                        const odds = customOdds[i] || { value: 110, isPositive: false };
                        return sum + americanToImpliedProb(odds.value, odds.isPositive);
                      }, 0) * 100).toFixed(1)}%`}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        ) : null}

        {step === 4 ? (
          <View style={styles.section}>
            <Text style={styles.stepLabel}>Participant Limit</Text>
            
            <View style={styles.settingGroup}>
              <Text style={styles.settingTitle}>Max Participants</Text>
              <Text style={styles.settingDescription}>
                Limit how many people can join this bet
              </Text>
              <View style={styles.sliderContainer}>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={50}
                  step={1}
                  value={maxParticipants ? parseInt(maxParticipants, 10) : 0}
                  onValueChange={(value) => setMaxParticipants(value > 0 ? value.toString() : '')}
                  minimumTrackTintColor={COLORS.primary}
                  maximumTrackTintColor={COLORS.border}
                  thumbTintColor={COLORS.primary}
                />
                <Text style={styles.sliderValue}>
                  {maxParticipants ? maxParticipants + ' people' : 'Unlimited'}
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        {step === 5 ? (
          <View style={styles.section}>
            <Text style={styles.stepLabel}>Review</Text>
            <View style={styles.reviewContainer}>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Event</Text>
                <Text style={styles.reviewValue}>{title.trim()}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Closes</Text>
                <Text style={styles.reviewValue}>{formatDateTime(closeAt)}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Payout Examples</Text>
                <Text style={styles.reviewHelper}>If someone bets $1...</Text>
                {validOutcomes.map((item, idx) => {
                  let odds = 1;
                  if (useCustomOdds && customOdds[idx]) {
                    odds = americanToDecimal(customOdds[idx].value, customOdds[idx].isPositive);
                  }
                  const payout = (1 * odds).toFixed(2);
                  const oddsDisplay = customOdds[idx] 
                    ? `${customOdds[idx].isPositive ? '+' : '-'}${customOdds[idx].value}`
                    : 'Even';
                  return (
                    <Text key={item} style={styles.payoutExample}>
                      {item} ({oddsDisplay}): ${payout}
                    </Text>
                  );
                })}
              </View>
              {maxParticipants && (
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Max Participants</Text>
                  <Text style={styles.reviewValue}>{maxParticipants} people</Text>
                </View>
              )}
            </View>
          </View>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.footer}>
          {step < steps.length - 1 ? (
            <Button
              label="Next"
              onPress={handleNext}
              icon="arrow-right"
            />
          ) : (
            <Button label="Create Bet" onPress={handleCreate} icon="check" />
          )}
          {step > 0 && (
            <Button
              label="Back"
              variant="ghost"
              onPress={() => setStep(step - 1)}
              style={styles.backButton}
            />
          )}
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  section: {
    marginBottom: SPACING.xxl,
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.lg,
  },
  inputContainer: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.md,
  },
  titleInput: {
    fontSize: 32,
    fontWeight: '300',
    color: COLORS.text,
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  outcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: SPACING.lg,
    paddingHorizontal: 0,
    gap: SPACING.md,
    backgroundColor: 'transparent',
  },
  outcomeInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '400',
    color: COLORS.text,
    paddingVertical: 0,
    paddingHorizontal: 0,
    minHeight: 28,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.primary,
  },
  timeRow: {
    flexDirection: 'row',
    gap: SPACING.xl,
  },
  timeCard: {
    flex: 1,
    paddingVertical: SPACING.xl,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
  },
  timeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  timeValue: {
    fontSize: 24,
    fontWeight: '300',
    color: COLORS.text,
  },
  settingGroup: {
    marginBottom: SPACING.xxl,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  settingDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.muted,
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  oddsContainer: {
    marginTop: SPACING.lg,
  },
  oddsRow: {
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  oddsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  oddsOutcome: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.text,
    flex: 1,
  },
  oddsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  oddsToggle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  oddsSign: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  oddsValue: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
  },
  oddsMultiplier: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.muted,
  },
  oddsSlider: {
    width: '100%',
    height: 40,
    marginVertical: SPACING.xs,
  },
  impliedProb: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  oddsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingTop: SPACING.lg,
    justifyContent: 'center',
  },
  oddsInfoText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  sliderContainer: {
    marginTop: SPACING.lg,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderValue: {
    fontSize: 24,
    fontWeight: '300',
    color: COLORS.text,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  reviewContainer: {
    gap: SPACING.xl,
  },
  reviewRow: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.lg,
  },
  reviewLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  reviewValue: {
    fontSize: 18,
    fontWeight: '400',
    color: COLORS.text,
    lineHeight: 28,
  },
  reviewHelper: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.muted,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  payoutExample: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.text,
    paddingVertical: SPACING.xs,
  },
  error: {
    color: COLORS.danger,
    marginTop: SPACING.lg,
    fontWeight: '500',
    fontSize: 14,
    textAlign: 'center',
  },
  footer: {
    marginTop: SPACING.xxl,
  },
  backButton: {
    marginTop: SPACING.sm,
  },
});

export default CreateBetWizard;
