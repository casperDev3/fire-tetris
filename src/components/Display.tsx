import React from 'react';

interface DisplayProps {
  gameOver?: boolean;
  text: string;
}

const Display: React.FC<DisplayProps> = ({ gameOver, text }) => (
  <div
    className={`
      box-border flex items-center mb-4 p-4 rounded-xl border-4 
      ${gameOver ? 'border-red-600 text-red-600' : 'border-orange-800 text-orange-400'}
      bg-black font-mono text-lg w-full
    `}
  >
    {text}
  </div>
);

export default Display;
