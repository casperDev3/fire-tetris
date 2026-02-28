import { useState, useEffect, useCallback } from 'react';

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export type TetrominoType = '0' | 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export const TETROMINOES: Record<string, { shape: (string | number)[][], color: string }> = {
  0: { shape: [[0]], color: '0, 0, 0' },
  I: {
    shape: [
      [0, 'I', 0, 0],
      [0, 'I', 0, 0],
      [0, 'I', 0, 0],
      [0, 'I', 0, 0],
    ],
    color: '80, 227, 230',
  },
  J: {
    shape: [
      [0, 'J', 0],
      [0, 'J', 0],
      ['J', 'J', 0],
    ],
    color: '36, 95, 223',
  },
  L: {
    shape: [
      [0, 'L', 0],
      [0, 'L', 0],
      [0, 'L', 'L'],
    ],
    color: '223, 173, 36',
  },
  O: {
    shape: [
      ['O', 'O'],
      ['O', 'O'],
    ],
    color: '223, 217, 36',
  },
  S: {
    shape: [
      [0, 'S', 'S'],
      ['S', 'S', 0],
      [0, 0, 0],
    ],
    color: '48, 211, 56',
  },
  T: {
    shape: [
      [0, 0, 0],
      ['T', 'T', 'T'],
      [0, 'T', 0],
    ],
    color: '132, 61, 198',
  },
  Z: {
    shape: [
      ['Z', 'Z', 0],
      [0, 'Z', 'Z'],
      [0, 0, 0],
    ],
    color: '227, 78, 78',
  },
};

export const randomTetromino = () => {
  const tetrominos = 'IJLOSTZ';
  const randTetromino = tetrominos[Math.floor(Math.random() * tetrominos.length)];
  return TETROMINOES[randTetromino];
};

export const createBoard = () =>
  Array.from(Array(BOARD_HEIGHT), () =>
    new Array(BOARD_WIDTH).fill(0).map(() => [0, 'clear'])
  );

export const checkCollision = (player: any, stage: any, { x: moveX, y: moveY }: { x: number, y: number }) => {
  for (let y = 0; y < player.tetromino.length; y += 1) {
    for (let x = 0; x < player.tetromino[y].length; x += 1) {
      // 1. Check that we're on an actual Tetromino cell
      if (player.tetromino[y][x] !== 0) {
        const nextY = y + player.pos.y + moveY;
        const nextX = x + player.pos.x + moveX;

        // 2. Check that our move is inside the game areas height (y)
        // We shouldn't go through the bottom of the play area
        if (nextY >= BOARD_HEIGHT) {
          return true;
        }

        // 3. Check that our move is inside the game areas width (x)
        if (nextX < 0 || nextX >= BOARD_WIDTH) {
          return true;
        }

        // 4. Check that the cell were moving to isn't set to clear
        // We only check this if we are inside the board (y >= 0)
        if (nextY >= 0) {
          if (!stage[nextY] || !stage[nextY][nextX] || stage[nextY][nextX][1] !== 'clear') {
            return true;
          }
        }
      }
    }
  }
  return false;
};
