import { useState, useEffect } from 'react';
import { createBoard, BOARD_WIDTH, BOARD_HEIGHT } from '../utils/gameHelpers';

export const useStage = (player: any, resetPlayer: any) => {
  const [stage, setStage] = useState(createBoard());
  const [rowsCleared, setRowsCleared] = useState(0);

  useEffect(() => {
    setRowsCleared(0);

    const sweepRows = (newStage: any) => {
      let clearedCount = 0;
      const rowsToClear: number[] = [];

      // Identify rows to clear
      newStage.forEach((row: any, i: number) => {
        if (row.findIndex((cell: any) => cell[0] === 0) === -1) {
          rowsToClear.push(i);
          clearedCount += 1;
        }
      });

      if (clearedCount > 0) {
        setRowsCleared(clearedCount);
        // Mark rows as clearing instead of removing immediately
        return newStage.map((row: any, i: number) => {
          if (rowsToClear.includes(i)) {
            return row.map((cell: any) => [cell[0], 'clearing']);
          }
          return row;
        });
      }
      
      return newStage;
    };

    const updateStage = (prevStage: any) => {
      // First flush the stage from the previous render
      const newStage = prevStage.map((row: any) =>
        row.map((cell: any) => (cell[1] === 'clear' ? [0, 'clear'] : cell))
      );

      // Then draw the tetromino
      player.tetromino.forEach((row: any, y: any) => {
        row.forEach((value: any, x: any) => {
          if (value !== 0) {
            const targetY = y + player.pos.y;
            const targetX = x + player.pos.x;

            if (
              targetY >= 0 && targetY < BOARD_HEIGHT &&
              targetX >= 0 && targetX < BOARD_WIDTH
            ) {
              newStage[targetY][targetX] = [
                value,
                `${player.collided ? 'merged' : 'clear'}`,
              ];
            }
          }
        });
      });

      // Check if collided
      if (player.collided) {
        resetPlayer();
        return sweepRows(newStage);
      }

      return newStage;
    };

    setStage((prev: any) => updateStage(prev));
  }, [player, resetPlayer]);

  // Effect to remove clearing rows after animation
  useEffect(() => {
    const hasClearingRows = stage.some((row: any[]) => row[0][1] === 'clearing');

    if (hasClearingRows) {
      const timer = setTimeout(() => {
        setStage((prev) => {
          return prev.reduce((ack: any, row: any) => {
            if (row[0][1] === 'clearing') {
              ack.unshift(new Array(prev[0].length).fill(0).map(() => [0, 'clear']));
              return ack;
            }
            ack.push(row);
            return ack;
          }, []);
        });
      }, 300); // 300ms animation duration

      return () => clearTimeout(timer);
    }
  }, [stage]);

  return [stage, setStage, rowsCleared] as const;
};
