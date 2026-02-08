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

export { sumValues, getOutcomeTotals, getBetStatus, calculateResults };
