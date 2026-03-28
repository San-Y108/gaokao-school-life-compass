import { School } from '@/types/school';

export type CompareState = {
  schoolIds: string[];
};

export const MAX_COMPARE_SCHOOLS = 3;

export const getInitialState = (): CompareState => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('compareState');
      if (saved) {
        return JSON.parse(saved) as CompareState;
      }
    } catch (e) {
      console.error('Failed to parse compare state from localStorage:', e);
    }
  }
  return { schoolIds: [] };
};

export const saveState = (state: CompareState) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('compareState', JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save compare state to localStorage:', e);
    }
  }
};

export const addToCompare = (state: CompareState, schoolId: string): CompareState => {
  if (state.schoolIds.includes(schoolId)) {
    return state;
  }
  if (state.schoolIds.length >= MAX_COMPARE_SCHOOLS) {
    return state;
  }
  const newState = {
    ...state,
    schoolIds: [...state.schoolIds, schoolId]
  };
  saveState(newState);
  return newState;
};

export const removeFromCompare = (state: CompareState, schoolId: string): CompareState => {
  const newState = {
    ...state,
    schoolIds: state.schoolIds.filter(id => id !== schoolId)
  };
  saveState(newState);
  return newState;
};

export const clearCompare = (): CompareState => {
  const newState = { schoolIds: [] };
  saveState(newState);
  return newState;
};