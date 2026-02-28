import { useState, useEffect, useCallback } from 'react';
import { createBoard, checkCollision, randomTetromino, BOARD_WIDTH, BOARD_HEIGHT, TETROMINOES } from '../utils/gameHelpers';

export const useTetris = () => {
  const [stage, setStage] = useState(createBoard());
  const [dropTime, setDropTime] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [rows, setRows] = useState(0);
  const [level, setLevel] = useState(0);

  const [player, setPlayer] = useState({
    pos: { x: 0, y: 0 },
    tetromino: TETROMINOES['Z'].shape, // Initial placeholder
    collided: false,
  });

  const movePlayer = (dir: number) => {
    if (!checkCollision(player, stage, { x: dir, y: 0 })) {
      updatePlayerPos({ x: dir, y: 0, collided: false });
    }
  };

  const startGame = () => {
    // Reset everything
    setStage(createBoard());
    setDropTime(1000);
    resetPlayer();
    setGameOver(false);
    setScore(0);
    setRows(0);
    setLevel(0);
  };

  const updatePlayerPos = ({ x, y, collided }: { x: number, y: number, collided: boolean }) => {
    setPlayer(prev => ({
      ...prev,
      pos: { x: (prev.pos.x += x), y: (prev.pos.y += y) },
      collided,
    }));
  };

  const resetPlayer = useCallback(() => {
    const newTetromino = randomTetromino().shape;
    setPlayer({
      pos: { x: BOARD_WIDTH / 2 - 2, y: 0 },
      tetromino: newTetromino,
      collided: false,
    });
  }, []);

  const drop = () => {
    // Increase level when player has cleared 10 rows
    if (rows > (level + 1) * 10) {
      setLevel(prev => prev + 1);
      // Also increase speed
      setDropTime(1000 / (level + 1) + 200);
    }

    if (!checkCollision(player, stage, { x: 0, y: 1 })) {
      updatePlayerPos({ x: 0, y: 1, collided: false });
    } else {
      // Game Over
      if (player.pos.y < 1) {
        setGameOver(true);
        setDropTime(null);
      }
      updatePlayerPos({ x: 0, y: 0, collided: true });
    }
  };

  const keyUp = ({ keyCode }: { keyCode: number }) => {
    if (!gameOver) {
      // Activate the interval again when user releases down arrow
      if (keyCode === 40) {
        setDropTime(1000 / (level + 1) + 200);
      }
    }
  };

  const dropPlayer = () => {
    setDropTime(null);
    drop();
  };

  const move = ({ keyCode }: { keyCode: number }) => {
    if (!gameOver) {
      if (keyCode === 37) { // Left
        movePlayer(-1);
      } else if (keyCode === 39) { // Right
        movePlayer(1);
      } else if (keyCode === 40) { // Down
        dropPlayer();
      } else if (keyCode === 38) { // Up
        playerRotate(stage, 1);
      }
    }
  };

  const playerRotate = (stage: any, dir: number) => {
    const clonedPlayer = JSON.parse(JSON.stringify(player));
    clonedPlayer.tetromino = rotate(clonedPlayer.tetromino, dir);

    const pos = clonedPlayer.pos.x;
    let offset = 1;
    while (checkCollision(clonedPlayer, stage, { x: 0, y: 0 })) {
      clonedPlayer.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > clonedPlayer.tetromino[0].length) {
        rotate(clonedPlayer.tetromino, -dir);
        clonedPlayer.pos.x = pos;
        return;
      }
    }
    setPlayer(clonedPlayer);
  };

  const rotate = (matrix: any, dir: number) => {
    // Transpose rows to cols
    const rotatedTetro = matrix.map((_: any, index: number) =>
      matrix.map((col: any) => col[index])
    );
    // Reverse each row to get a rotated matrix
    if (dir > 0) return rotatedTetro.map((row: any) => row.reverse());
    return rotatedTetro.reverse();
  };

  useEffect(() => {
    const sweepRows = (newStage: any) => {
      return newStage.reduce((ack: any, row: any) => {
        if (row.findIndex((cell: any) => cell[0] === 0) === -1) {
          setRows(prev => prev + 1);
          setScore(prev => prev + 10 * (level + 1)); // Simple scoring
          ack.unshift(new Array(newStage[0].length).fill([0, 'clear']));
          return ack;
        }
        ack.push(row);
        return ack;
      }, []);
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
            newStage[y + player.pos.y][x + player.pos.x] = [
              value,
              `${player.collided ? 'merged' : 'clear'}`,
              // We need to know the color/type to render correctly later
              // This is a simplification, ideally we pass the type
              'fire-block' 
            ];
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

  // Use useInterval custom hook or simple useEffect for game loop
  useEffect(() => {
    if (!dropTime) return;
    const interval = setInterval(() => {
      drop();
    }, dropTime);
    return () => clearInterval(interval);
  }, [dropTime, drop]);

  return { stage, startGame, gameOver, score, rows, level, move, keyUp };
};
