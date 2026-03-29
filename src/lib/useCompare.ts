import { useState, useCallback } from 'react';
import { CompareState, addToCompare, removeFromCompare, clearCompare, getInitialState } from '@/lib/compare';

export const useCompare = () => {
  const [compareState, setCompareState] = useState<CompareState>(getInitialState());

  const handleAddToCompare = useCallback((schoolId: string) => {
    setCompareState((prev) => addToCompare(prev, schoolId));
  }, []);

  const handleRemoveFromCompare = useCallback((schoolId: string) => {
    setCompareState((prev) => removeFromCompare(prev, schoolId));
  }, []);

  const handleClearCompare = useCallback(() => {
    setCompareState(clearCompare());
  }, []);

  return {
    compareState,
    addToCompare: handleAddToCompare,
    removeFromCompare: handleRemoveFromCompare,
    clearCompare: handleClearCompare
  };
};
