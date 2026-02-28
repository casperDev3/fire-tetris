import React from 'react';
import { TETROMINOES } from '../utils/gameHelpers';
import { motion } from 'motion/react';

interface CellProps {
  type: keyof typeof TETROMINOES;
  isClearing?: boolean;
}

const Cell: React.FC<CellProps> = ({ type, isClearing }) => {
  const color = TETROMINOES[type] ? TETROMINOES[type].color : '0,0,0';
  const isFilled = type !== 0;

  // Fire effect styles
  const fireStyle = isFilled
    ? {
        background: `linear-gradient(135deg, rgba(${color}, 1) 0%, rgba(${color}, 0.6) 100%)`,
        border: `2px solid rgba(${color}, 1)`,
        boxShadow: `0 0 15px rgba(${color}, 0.6), inset 0 0 10px rgba(255, 255, 255, 0.3)`,
      }
    : {
        background: 'rgba(0, 0, 0, 0.8)',
        border: '1px solid rgba(40, 40, 40, 1)',
      };

  return (
    <motion.div
      className={`w-full h-full rounded-sm ${isFilled && !isClearing ? 'animate-[fire_2s_infinite_alternate]' : ''}`}
      style={fireStyle}
      initial={isFilled ? { scale: 0.8, opacity: 0 } : {}}
      animate={
        isClearing
          ? { scale: [1, 1.2, 0], opacity: [1, 1, 0], filter: "brightness(2)" }
          : isFilled
          ? { scale: 1, opacity: 1 }
          : {}
      }
      transition={{ duration: isClearing ? 0.3 : 0.1 }}
    />
  );
};

export default React.memo(Cell);
