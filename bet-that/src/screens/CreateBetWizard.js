import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { Feather } from '@expo/vector-icons';
import { Screen, TopBar } from '../components/layout';
import { Button, Card, Input, StepIndicator } from '../components/common';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants';
import { createId } from '../utils/id';
import { formatDateTime } from '../utils/formatters';
import { useBets } from '../context/BetContext';

const MAX_OUTCOMES = 6;
const MIN_OUTCOMES = 2;

const CreateBetWizard = ({ navigation }) => {
  const { createBet } = useBets();
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [outcomes, setOutcomes] = useState([
    { id: createId('outcome'), label: '' },
    { id: createId('outcome'), label: '' },
  ]);
  const [closeAt, setCloseAt] = useState(new Date(Date.now() + 90 * 60000));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [error, setError] = useState('');

  const steps = ['Basics', 'Outcomes', 'Timing', 'Review'];

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
        setError('Add a clear event title.');
        return false;
      }
      if (creatorName.trim().length < 2) {
        setError('Add your name or nickname.');
        return false;
      }
    }
    if (step === 1) {
      if (validOutcomes.length < MIN_OUTCOMES) {
        setError('Add at least two outcomes.');
        return false;
      }
    }
    if (step === 2) {
      if (closeAt.getTime() <= Date.now() + 60000) {
        setError('Pick a close time in the future.');
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
      setError('Limit outcomes to six.');
      return;
    }
    const bet = createBet({
      title: title.trim(),
      description: description.trim(),
      rules: rules.trim(),
      closeAt: closeAt.toISOString(),
      outcomes: validOutcomes.map((label) => ({
        id: createId('outcome'),
        label,
      })),
      creatorName: creatorName.trim(),
    });
    navigation.navigate('CreateSuccess', { betId: bet.id });
  };

  const addOutcome = () => {
    if (outcomes.length >= MAX_OUTCOMES) return;
    setOutcomes((prev) => [...prev, { id: createId('outcome'), label: '' }]);
  };

  const removeOutcome = (id) => {
    if (outcomes.length <= MIN_OUTCOMES) return;
    setOutcomes((prev) => prev.filter((item) => item.id !== id));
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
          <Card>
            <Text style={styles.sectionTitle}>Basic info</Text>
            <Input
              label="Event title"
              value={title}
              onChangeText={setTitle}
              placeholder="Will our team win tonight?"
              helper={`${title.length}/80`}
              maxLength={80}
            />
            <Input
              label="Description"
              value={description}
              onChangeText={setDescription}
              placeholder="Add the short backstory"
              helper={`${description.length}/140`}
              maxLength={140}
              multiline
            />
            <Input
              label="Rules or notes"
              value={rules}
              onChangeText={setRules}
              placeholder="How should ties be handled?"
              helper={`${rules.length}/140`}
              maxLength={140}
              multiline
            />
            <Input
              label="Your name"
              value={creatorName}
              onChangeText={setCreatorName}
              placeholder="How should you appear?"
            />
          </Card>
        ) : null}

        {step === 1 ? (
          <Card>
            <Text style={styles.sectionTitle}>Outcomes</Text>
            <Text style={styles.helper}>
              Drag to reorder. Keep it to {MIN_OUTCOMES} to {MAX_OUTCOMES}.
            </Text>
            <DraggableFlatList
              data={outcomes}
              keyExtractor={(item) => item.id}
              onDragEnd={({ data }) => setOutcomes(data)}
              scrollEnabled={false}
              renderItem={({ item, drag, isActive, index }) => (
                <View style={[styles.outcomeRow, isActive && styles.outcomeActive]}>
                  <Pressable
                    onLongPress={drag}
                    style={styles.dragHandle}
                    accessibilityRole="button"
                    accessibilityLabel="Reorder outcome"
                  >
                    <Feather name="menu" size={18} color={COLORS.muted} />
                  </Pressable>
                  <Input
                    value={item.label}
                    onChangeText={(text) =>
                      setOutcomes((prev) =>
                        prev.map((outcome) =>
                          outcome.id === item.id ? { ...outcome, label: text } : outcome
                        )
                      )
                    }
                    placeholder={`Outcome ${index + 1}`}
                    style={styles.outcomeInput}
                    containerStyle={styles.outcomeInputContainer}
                  />
                  {outcomes.length > MIN_OUTCOMES ? (
                    <Pressable
                      onPress={() => removeOutcome(item.id)}
                      accessibilityRole="button"
                      accessibilityLabel="Remove outcome"
                    >
                      <Feather name="x" size={18} color={COLORS.warning} />
                    </Pressable>
                  ) : null}
                </View>
              )}
            />
            <Button
              label="Add outcome"
              variant="secondary"
              icon="plus"
              onPress={addOutcome}
              disabled={outcomes.length >= MAX_OUTCOMES}
            />
          </Card>
        ) : null}

        {step === 2 ? (
          <Card>
            <Text style={styles.sectionTitle}>Timing</Text>
            <Text style={styles.helper}>Pick when betting closes.</Text>
            <View style={styles.timeRow}>
              <Pressable
                onPress={() => setShowDatePicker(true)}
                style={styles.timeCard}
                accessibilityRole="button"
                accessibilityLabel="Select close date"
              >
                <Text style={styles.timeLabel}>Date</Text>
                <Text style={styles.timeValue}>{closeAtDisplay.date}</Text>
              </Pressable>
              <Pressable
                onPress={() => setShowTimePicker(true)}
                style={styles.timeCard}
                accessibilityRole="button"
                accessibilityLabel="Select close time"
              >
                <Text style={styles.timeLabel}>Time</Text>
                <Text style={styles.timeValue}>{closeAtDisplay.time}</Text>
              </Pressable>
            </View>
            <Text style={styles.helper}>
              Betting closes on {formatDateTime(closeAt)}.
            </Text>
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
          </Card>
        ) : null}

        {step === 3 ? (
          <Card>
            <Text style={styles.sectionTitle}>Review</Text>
            <Text style={styles.helper}>Confirm the details before sharing.</Text>
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>Event</Text>
              <Text style={styles.reviewValue}>{title.trim()}</Text>
            </View>
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>Closes</Text>
              <Text style={styles.reviewValue}>{formatDateTime(closeAt)}</Text>
            </View>
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>Outcomes</Text>
              <View>
                {validOutcomes.map((item) => (
                  <Text key={item} style={styles.reviewValue}>
                    • {item}
                  </Text>
                ))}
              </View>
            </View>
          </Card>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.footer}>
          {step > 0 ? (
            <Button
              label="Back"
              variant="ghost"
              onPress={() => setStep(step - 1)}
            />
          ) : null}
          {step < steps.length - 1 ? (
            <Button
              label="Next"
              onPress={handleNext}
              icon="arrow-right"
            />
          ) : (
            <Button label="Create bet" onPress={handleCreate} icon="check" />
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
  sectionTitle: {
    fontSize: TYPOGRAPHY.subhead,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  helper: {
    color: COLORS.muted,
    marginBottom: SPACING.md,
  },
  outcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  outcomeActive: {
    backgroundColor: COLORS.highlight,
    borderRadius: 12,
    padding: SPACING.sm,
  },
  dragHandle: {
    padding: SPACING.sm,
  },
  outcomeInput: {
    flex: 1,
  },
  outcomeInputContainer: {
    marginBottom: 0,
    flex: 1,
  },
  timeRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  timeCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeLabel: {
    color: COLORS.muted,
    fontSize: 12,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  reviewRow: {
    marginBottom: SPACING.md,
  },
  reviewLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.muted,
    marginBottom: SPACING.xs,
  },
  reviewValue: {
    fontSize: 15,
    color: COLORS.text,
  },
  error: {
    color: COLORS.danger,
    marginTop: SPACING.sm,
    fontWeight: '600',
  },
  footer: {
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
});

export default CreateBetWizard;
