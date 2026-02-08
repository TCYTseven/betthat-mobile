const BET_LINK_BASE = 'bet/';
const CREATOR_LINK_BASE = 'creator/';

const parseLinkId = (value, type) => {
  if (!value) return null;
  const normalized = value.trim().replace(/\s/g, '');
  
  // Handle full URLs if they still exist
  if (normalized.includes('/bet/')) {
    return normalized.split('/bet/').pop();
  }
  if (normalized.includes('/creator/')) {
    return normalized.split('/creator/').pop();
  }
  
  // Handle short codes or IDs directly
  return normalized.length >= 4 ? normalized : null;
};

export { BET_LINK_BASE, CREATOR_LINK_BASE, parseLinkId };
