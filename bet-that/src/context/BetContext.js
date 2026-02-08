import React, { createContext, useContext, useState } from 'react';
import { createId } from '../utils/id';

const BetContext = createContext(null);

const SAMPLE_BET_ID = 'example-bet';

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
        isLocal: false,
      },
      {
        id: 'p2',
        name: 'Sam',
        outcomeId: 'no',
        amount: 15,
        createdAt: new Date().toISOString(),
        isLocal: false,
      },
      {
        id: 'p3',
        name: 'Priya',
        outcomeId: 'yes',
        amount: 10,
        createdAt: new Date().toISOString(),
        isLocal: false,
      },
      {
        id: 'p4',
        name: 'Jules',
        outcomeId: 'tie',
        amount: 8,
        createdAt: new Date().toISOString(),
        isLocal: false,
      },
    ],
  },
];

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
          ? {
              ...bet,
              participants: [...bet.participants, { ...wager, isLocal: true }],
            }
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

  const resetBets = () => setBets(initialBets);

  return (
    <BetContext.Provider
      value={{
        bets,
        createBet,
        addWager,
        closeBet,
        resolveBet,
        resetBets,
        sampleBetId: SAMPLE_BET_ID,
      }}
    >
      {children}
    </BetContext.Provider>
  );
};

const useBets = () => useContext(BetContext);

export { BetProvider, useBets };
