const BET_LINK_BASE = 'https://betthat.app/bet/';
const CREATOR_LINK_BASE = 'https://betthat.app/creator/';

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

export { BET_LINK_BASE, CREATOR_LINK_BASE, parseLinkId };
