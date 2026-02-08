import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@bet-that/onboarding-complete';
const USER_NAME_KEY = '@bet-that/user-name';

const OnboardingContext = createContext(null);

const OnboardingProvider = ({ children, onReady }) => {
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadState = async () => {
      try {
        const onboardingValue = await AsyncStorage.getItem(STORAGE_KEY);
        const nameValue = await AsyncStorage.getItem(USER_NAME_KEY);
        setHasOnboarded(onboardingValue === 'true');
        setUserName(nameValue || '');
      } catch (error) {
        setHasOnboarded(false);
        setUserName('');
      } finally {
        setIsLoading(false);
        if (onReady) {
          onReady();
        }
      }
    };
    loadState();
  }, [onReady]);

  const completeOnboarding = async (name) => {
    setHasOnboarded(true);
    setUserName(name || '');
    try {
      await AsyncStorage.setItem(STORAGE_KEY, 'true');
      if (name) {
        await AsyncStorage.setItem(USER_NAME_KEY, name);
      }
    } catch (error) {
      // Persisting onboarding is a best effort.
    }
  };

  const resetOnboarding = async () => {
    setHasOnboarded(false);
    setUserName('');
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      await AsyncStorage.removeItem(USER_NAME_KEY);
    } catch (error) {
      // Best effort.
    }
  };

  const updateUserName = async (name) => {
    setUserName(name);
    try {
      await AsyncStorage.setItem(USER_NAME_KEY, name);
    } catch (error) {
      // Best effort.
    }
  };

  return (
    <OnboardingContext.Provider
      value={{ hasOnboarded, userName, isLoading, completeOnboarding, resetOnboarding, updateUserName }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

const useOnboarding = () => useContext(OnboardingContext);

export { OnboardingProvider, useOnboarding };
