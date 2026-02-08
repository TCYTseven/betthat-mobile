import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Screen, TopBar } from '../components/layout';
import { Button, Input } from '../components/common';
import { COLORS, SPACING } from '../constants';
import { useOnboarding } from '../context/OnboardingContext';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TEST_SESSIONS_KEY = '@bet-that/test-sessions';
const ACTIVE_SESSION_KEY = '@bet-that/active-session';

const TestScreen = ({ navigation }) => {
  const { userName, updateUserName } = useOnboarding();
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [newSessionName, setNewSessionName] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const sessionsData = await AsyncStorage.getItem(TEST_SESSIONS_KEY);
      const activeId = await AsyncStorage.getItem(ACTIVE_SESSION_KEY);
      
      if (sessionsData) {
        setSessions(JSON.parse(sessionsData));
      }
      if (activeId) {
        setActiveSessionId(activeId);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const createSession = async () => {
    if (!newSessionName.trim()) return;

    const newSession = {
      id: `session-${Date.now()}`,
      name: newSessionName.trim(),
      createdAt: new Date().toISOString(),
    };

    const updatedSessions = [...sessions, newSession];
    setSessions(updatedSessions);
    setNewSessionName('');

    try {
      await AsyncStorage.setItem(TEST_SESSIONS_KEY, JSON.stringify(updatedSessions));
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  };

  const switchSession = async (sessionId, sessionName) => {
    setLoading(true);
    setActiveSessionId(sessionId);
    
    try {
      await AsyncStorage.setItem(ACTIVE_SESSION_KEY, sessionId);
      await updateUserName(sessionName);
      
      // Reload the app state
      setTimeout(() => {
        setLoading(false);
        navigation.navigate('Home');
      }, 500);
    } catch (error) {
      console.error('Failed to switch session:', error);
      setLoading(false);
    }
  };

  const deleteSession = async (sessionId) => {
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(updatedSessions);

    try {
      await AsyncStorage.setItem(TEST_SESSIONS_KEY, JSON.stringify(updatedSessions));
      
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        await AsyncStorage.removeItem(ACTIVE_SESSION_KEY);
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const clearAllSessions = async () => {
    setSessions([]);
    setActiveSessionId(null);
    
    try {
      await AsyncStorage.removeItem(TEST_SESSIONS_KEY);
      await AsyncStorage.removeItem(ACTIVE_SESSION_KEY);
    } catch (error) {
      console.error('Failed to clear sessions:', error);
    }
  };

  return (
    <Screen>
      <TopBar title="Test Mode" />
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current User</Text>
        <View style={styles.currentUser}>
          <Feather name="user" size={20} color={COLORS.primary} />
          <Text style={styles.currentUserName}>{userName || 'Anonymous'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Create Test Session</Text>
        <Input
          value={newSessionName}
          onChangeText={setNewSessionName}
          placeholder="Enter friend name"
          containerStyle={styles.input}
        />
        <Button
          label="Create Session"
          onPress={createSession}
          icon="plus"
          disabled={!newSessionName.trim()}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Test Sessions ({sessions.length})</Text>
          {sessions.length > 0 && (
            <Pressable onPress={clearAllSessions}>
              <Text style={styles.clearAll}>Clear All</Text>
            </Pressable>
          )}
        </View>
        
        <ScrollView style={styles.sessionsList}>
          {sessions.length === 0 ? (
            <Text style={styles.emptyText}>
              Create test sessions to simulate different users joining bets
            </Text>
          ) : (
            sessions.map((session) => {
              const isActive = session.id === activeSessionId;
              
              return (
                <View key={session.id} style={styles.sessionCard}>
                  <View style={styles.sessionInfo}>
                    <View style={styles.sessionHeader}>
                      <Text style={styles.sessionName}>{session.name}</Text>
                      {isActive && (
                        <View style={styles.activeBadge}>
                          <Text style={styles.activeBadgeText}>Active</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.sessionActions}>
                    <Pressable
                      onPress={() => switchSession(session.id, session.name)}
                      style={styles.actionButton}
                      disabled={isActive || loading}
                    >
                      <Feather 
                        name="log-in" 
                        size={18} 
                        color={isActive ? COLORS.muted : COLORS.primary} 
                      />
                    </Pressable>
                    <Pressable
                      onPress={() => deleteSession(session.id)}
                      style={styles.actionButton}
                      disabled={loading}
                    >
                      <Feather name="trash-2" size={18} color={COLORS.danger} />
                    </Pressable>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </View>

      <View style={styles.info}>
        <Feather name="info" size={16} color={COLORS.muted} />
        <Text style={styles.infoText}>
          Switch sessions to simulate different users. Each session has its own identity.
        </Text>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: SPACING.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  currentUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.lg,
    backgroundColor: COLORS.highlight,
    borderRadius: 8,
  },
  currentUserName: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.text,
  },
  input: {
    marginBottom: SPACING.md,
  },
  clearAll: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.danger,
  },
  sessionsList: {
    maxHeight: 300,
  },
  sessionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  sessionName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  activeBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sessionActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  actionButton: {
    padding: SPACING.sm,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    paddingVertical: SPACING.xl,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.highlight,
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 18,
  },
});

export default TestScreen;
