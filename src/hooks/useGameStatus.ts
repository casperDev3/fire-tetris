import { useState, useEffect, useCallback } from 'react';

export const useGameStatus = (rowsCleared: number) => {
  const [score, setScore] = useState(0);
  const [rows, setRows] = useState(0);
  const [level, setLevel] = useState(0);

  useEffect(() => {
    if (rowsCleared > 0) {
      const linePoints = [40, 100, 300, 1200];
      setScore(prev => prev + linePoints[rowsCleared - 1] * (level + 1));
      setRows(prev => prev + rowsCleared);
      setLevel(prev => prev + Math.floor(rowsCleared / 10)); // Simplified leveling
    }
  }, [rowsCleared, level]);

  return [score, setScore, rows, setRows, level, setLevel] as const;
};
