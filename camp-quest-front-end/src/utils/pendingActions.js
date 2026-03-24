// src/utils/pendingActions.js

const PENDING_ACTION_KEY = 'campquest_pending_action';

export const savePendingAction = (action) => {
  localStorage.setItem(PENDING_ACTION_KEY, JSON.stringify(action));
};

export const getPendingAction = () => {
  const actionStr = localStorage.getItem(PENDING_ACTION_KEY);
  if (!actionStr) return null;
  try {
    return JSON.parse(actionStr);
  } catch (e) {
    console.error('Failed to parse pending action:', e);
    return null;
  }
};

export const clearPendingAction = () => {
  localStorage.removeItem(PENDING_ACTION_KEY);
};