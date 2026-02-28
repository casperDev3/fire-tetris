import React, { useState, useEffect, useCallback } from 'react';
import { createBoard, checkCollision } from '../utils/gameHelpers';
import { useInterval } from '../hooks/useInterval';
import { usePlayer } from '../hooks/usePlayer';
import { useStage } from '../hooks/useStage';
import { useGameStatus } from '../hooks/useGameStatus';

import Board from './Board';
import Display from './Display';
import StartButton from './StartButton';
import { motion } from 'motion/react';
import { Flame, Trophy, Layers, Zap, Pause, Play, RotateCcw } from 'lucide-react';

const Tetris: React.FC = () => {
  const [dropTime, setDropTime] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const [player, updatePlayerPos, resetPlayer, playerRotate] = usePlayer();
  const [stage, setStage, rowsCleared] = useStage(player, resetPlayer);
  const [score, setScore, rows, setRows, level, setLevel] = useGameStatus(rowsCleared);

  const movePlayer = useCallback((dir: number) => {
    if (!checkCollision(player, stage, { x: dir, y: 0 })) {
      updatePlayerPos({ x: dir, y: 0, collided: false });
    }
  }, [player, stage, updatePlayerPos]);

  const startGame = () => {
    // Reset everything
    setStage(createBoard());
    setDropTime(1000);
    resetPlayer();
    setGameOver(false);
    setScore(0);
    setRows(0);
    setLevel(0);
    setIsPaused(false);
    setGameStarted(true);
  };

  const togglePause = () => {
    if (!gameStarted || gameOver) return;
    
    if (isPaused) {
      // Resume
      setIsPaused(false);
      setDropTime(1000 / (level + 1) + 200);
    } else {
      // Pause
      setIsPaused(true);
      setDropTime(null);
    }
  };

  const drop = useCallback(() => {
    // Increase level when player has cleared 10 rows
    if (rows > (level + 1) * 10) {
      setLevel((prev) => prev + 1);
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
        setGameStarted(false);
      }
      updatePlayerPos({ x: 0, y: 0, collided: true });
    }
  }, [player, stage, rows, level, setLevel, updatePlayerPos]);

  const dropPlayer = useCallback(() => {
    setDropTime(null);
    drop();
  }, [drop]);

  const handleKeyUp = useCallback(({ key }: { key: string }) => {
    if (!gameOver && !isPaused) {
      // Activate the interval again when user releases down arrow
      if (key === "ArrowDown") {
        setDropTime(1000 / (level + 1) + 200);
      }
    }
  }, [gameOver, isPaused, level]);

  // Handle keyboard controls via window event listener to fix focus issues
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted || gameOver || isPaused) return;

      // Prevent default scrolling for game keys
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === "ArrowLeft") {
        movePlayer(-1);
      } else if (e.key === "ArrowRight") {
        movePlayer(1);
      } else if (e.key === "ArrowDown") {
        dropPlayer();
      } else if (e.key === "ArrowUp") {
        playerRotate(stage, 1);
      }
    };

    const handleKeyUpEvent = (e: KeyboardEvent) => {
       handleKeyUp({ key: e.key });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUpEvent);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUpEvent);
    };
  }, [gameStarted, gameOver, isPaused, movePlayer, dropPlayer, playerRotate, stage, handleKeyUp]);

  useInterval(() => {
    drop();
  }, dropTime);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-black text-white overflow-x-hidden overflow-y-auto outline-none"
      style={{
        background: 'radial-gradient(circle, rgba(60,20,0,1) 0%, rgba(0,0,0,1) 100%)',
      }}
    >
      <div className="absolute inset-0 z-0 pointer-events-none fixed">
        {/* Background Fire Particles Effect */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-orange-500 opacity-20 blur-xl"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: (typeof window !== 'undefined' ? window.innerHeight : 1000) + 100,
              scale: Math.random() * 2 + 1,
            }}
            animate={{
              y: -100,
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5,
            }}
            style={{
              width: Math.random() * 50 + 20,
              height: Math.random() * 50 + 20,
              left: `${Math.random() * 100}%`, // Use percentage for safer positioning
              transform: 'translateX(-50%)',
            }}
          />
        ))}
      </div>

      <div className="z-10 flex flex-col lg:flex-row gap-12 items-start max-w-6xl w-full p-8 bg-black/40 backdrop-blur-md rounded-3xl border border-orange-900/30 shadow-2xl">
        <div className="flex-1 w-full max-w-[450px] mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative">
            <Board stage={stage} />
            {isPaused && !gameOver && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm rounded-lg border-4 border-orange-900/50 z-20">
                <div className="text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,165,0,0.8)] animate-pulse mb-4">
                  PAUSED
                </div>
                <p className="text-orange-300 font-mono">Press Resume to Continue</p>
              </div>
            )}
          </div>
        </div>

        <aside className="w-full lg:w-80 flex flex-col gap-6">
          <div className="text-center mb-2">
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] flex items-center justify-center gap-3 transform -skew-x-6">
              <Flame className="w-10 h-10 text-orange-500 animate-fire" />
              FIRE TETRIS
            </h1>
          </div>

          <div className="bg-black/60 p-6 rounded-2xl border border-orange-900/50 shadow-inner">
            {gameOver ? (
              <Display gameOver={gameOver} text="Game Over" />
            ) : (
              <div className="flex flex-col gap-4">
                <div className="bg-orange-950/30 p-4 rounded-xl border border-orange-900/30">
                  <div className="flex items-center gap-2 text-orange-400 mb-1 text-sm uppercase tracking-wider font-bold">
                    <Trophy size={16} /> Score
                  </div>
                  <div className="text-3xl font-mono text-white text-right drop-shadow-md">{score}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-orange-950/30 p-3 rounded-xl border border-orange-900/30">
                    <div className="flex items-center gap-2 text-orange-400 mb-1 text-xs uppercase tracking-wider font-bold">
                      <Layers size={14} /> Rows
                    </div>
                    <div className="text-2xl font-mono text-white text-right">{rows}</div>
                  </div>
                  
                  <div className="bg-orange-950/30 p-3 rounded-xl border border-orange-900/30">
                    <div className="flex items-center gap-2 text-orange-400 mb-1 text-xs uppercase tracking-wider font-bold">
                      <Zap size={14} /> Level
                    </div>
                    <div className="text-2xl font-mono text-white text-right">{level}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-3">
            {!gameStarted || gameOver ? (
              <StartButton callback={startGame} />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  className="box-border p-4 rounded-xl border-none text-white bg-gradient-to-r from-yellow-600 to-orange-600 font-mono text-lg font-bold cursor-pointer outline-none hover:from-yellow-500 hover:to-orange-500 transition-all shadow-[0_0_15px_rgba(255,165,0,0.4)] flex items-center justify-center gap-2 active:scale-95"
                  onClick={togglePause}
                >
                  {isPaused ? <Play size={20} /> : <Pause size={20} />}
                  {isPaused ? "Resume" : "Pause"}
                </button>
                
                <button
                  className="box-border p-4 rounded-xl border-none text-white bg-gradient-to-r from-red-600 to-red-800 font-mono text-lg font-bold cursor-pointer outline-none hover:from-red-500 hover:to-red-700 transition-all shadow-[0_0_15px_rgba(255,0,0,0.4)] flex items-center justify-center gap-2 active:scale-95"
                  onClick={startGame}
                >
                  <RotateCcw size={20} />
                  Restart
                </button>
              </div>
            )}
          </div>
          
          <div className="mt-auto text-sm text-orange-200/70 bg-black/60 p-5 rounded-2xl border border-orange-900/30 backdrop-blur-sm shadow-lg">
            <h3 className="font-bold text-orange-400 mb-3 flex items-center gap-2 uppercase tracking-wider text-xs">
              <Zap size={14} /> Controls
            </h3>
            <ul className="space-y-2 font-mono text-xs">
              <li className="flex justify-between items-center bg-white/5 p-2 rounded"><span>Move Left</span> <kbd className="bg-orange-900/80 px-2 py-1 rounded text-orange-100 shadow-sm">←</kbd></li>
              <li className="flex justify-between items-center bg-white/5 p-2 rounded"><span>Move Right</span> <kbd className="bg-orange-900/80 px-2 py-1 rounded text-orange-100 shadow-sm">→</kbd></li>
              <li className="flex justify-between items-center bg-white/5 p-2 rounded"><span>Rotate</span> <kbd className="bg-orange-900/80 px-2 py-1 rounded text-orange-100 shadow-sm">↑</kbd></li>
              <li className="flex justify-between items-center bg-white/5 p-2 rounded"><span>Soft Drop</span> <kbd className="bg-orange-900/80 px-2 py-1 rounded text-orange-100 shadow-sm">↓</kbd></li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Tetris;
