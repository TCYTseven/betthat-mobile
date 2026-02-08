import React, { useState } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { Screen, TopBar } from '../components/layout';
import { Button, Card, Input } from '../components/common';
import { COLORS, SPACING } from '../constants';
import { useOnboarding } from '../context/OnboardingContext';
import { useBets } from '../context/BetContext';

const ProfileScreen = ({ navigation }) => {
  const { userName, updateUserName, resetOnboarding } = useOnboarding();
  const { resetBets, sampleBetId } = useBets();
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);

  const handleSaveName = () => {
    if (tempName.trim()) {
      updateUserName(tempName.trim());
      setEditingName(false);
    }
  };

  return (
    <Screen>
      <TopBar title="Profile" />
      
      <Card>
        <Text style={styles.sectionTitle}>Your Identity</Text>
        {editingName ? (
          <View>
            <Input
              value={tempName}
              onChangeText={setTempName}
              placeholder="Your name"
              autoFocus
            />
            <View style={styles.nameActions}>
              <Button
                label="Cancel"
                variant="ghost"
                onPress={() => {
                  setTempName(userName);
                  setEditingName(false);
                }}
                style={{ flex: 1 }}
              />
              <Button
                label="Save"
                onPress={handleSaveName}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        ) : (
          <View>
            <Text style={styles.nameDisplay}>{userName || 'Anonymous'}</Text>
            <Button
              label="Change name"
              variant="secondary"
              icon="edit"
              onPress={() => setEditingName(true)}
              style={styles.buttonSpacing}
            />
          </View>
        )}
      </Card>

      <Card style={styles.cardSpacing}>
        <Text style={styles.sectionTitle}>Quick actions</Text>
        <Button
          label="How Bet That works"
          variant="secondary"
          onPress={() => navigation.navigate('Guide')}
          icon="play-circle"
          style={styles.buttonSpacing}
        />
        <Button
          label="View example bet"
          variant="secondary"
          onPress={() => navigation.navigate('BetDetail', { betId: sampleBetId })}
          icon="eye"
          style={styles.buttonSpacing}
        />
        <Button
          label="Reset onboarding"
          variant="ghost"
          onPress={resetOnboarding}
          icon="refresh-ccw"
          style={styles.buttonSpacing}
        />
        <Button
          label="Reset demo data"
          variant="ghost"
          onPress={resetBets}
          icon="trash-2"
          style={styles.buttonSpacing}
        />
      </Card>
      <Card style={styles.cardSpacing}>
        <Text style={styles.helper}>
          💡 Bet That never handles payments. All settlement happens offline between friends.
        </Text>
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  nameDisplay: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  nameActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  helper: {
    color: COLORS.muted,
    lineHeight: 20,
  },
  buttonSpacing: {
    marginTop: SPACING.sm,
  },
  cardSpacing: {
    marginTop: SPACING.md,
  },
});

export default ProfileScreen;
