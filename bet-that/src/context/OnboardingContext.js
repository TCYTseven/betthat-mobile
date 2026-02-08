import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@bet-that/onboarding-complete';

const OnboardingContext = createContext(null);

const OnboardingProvider = ({ children, onReady }) => {
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadState = async () => {
      try {
        const value = await AsyncStorage.getItem(STORAGE_KEY);
        setHasOnboarded(value === 'true');
      } catch (error) {
        setHasOnboarded(false);
      } finally {
        setIsLoading(false);
        if (onReady) {
          onReady();
        }
      }
    };
    loadState();
  }, [onReady]);

  const completeOnboarding = async () => {
    setHasOnboarded(true);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, 'true');
    } catch (error) {
      // Persisting onboarding is a best effort.
    }
  };

  const resetOnboarding = async () => {
    setHasOnboarded(false);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      // Best effort.
    }
  };

  return (
    <OnboardingContext.Provider
      value={{ hasOnboarded, isLoading, completeOnboarding, resetOnboarding }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

const useOnboarding = () => useContext(OnboardingContext);

export { OnboardingProvider, useOnboarding };
