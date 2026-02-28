import React from 'react';
import Cell from './Cell';
import { BOARD_WIDTH, BOARD_HEIGHT } from '../utils/gameHelpers';

interface BoardProps {
  stage: any[][];
}

const Board: React.FC<BoardProps> = ({ stage }) => {
  return (
    <div 
      className="grid gap-[1px] border-4 border-orange-900 bg-black p-1 rounded-lg shadow-[0_0_20px_rgba(255,69,0,0.5)]"
      style={{
        gridTemplateRows: `repeat(${BOARD_HEIGHT}, minmax(0, 1fr))`,
        gridTemplateColumns: `repeat(${BOARD_WIDTH}, minmax(0, 1fr))`,
        width: '100%',
        maxWidth: '400px',
        aspectRatio: `${BOARD_WIDTH} / ${BOARD_HEIGHT}`,
      }}
    >
      {stage.map((row) =>
        row.map((cell, x) => (
          <Cell key={x} type={cell[0]} isClearing={cell[1] === 'clearing'} />
        ))
      )}
    </div>
  );
};

export default Board;
