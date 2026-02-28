import React from 'react';

interface StartButtonProps {
  callback: () => void;
}

const StartButton: React.FC<StartButtonProps> = ({ callback }) => (
  <button
    className="box-border mb-4 p-4 min-h-[30px] w-full rounded-xl border-none text-white bg-gradient-to-r from-orange-600 to-red-600 font-mono text-xl cursor-pointer outline-none hover:from-orange-500 hover:to-red-500 transition-all shadow-[0_0_15px_rgba(255,69,0,0.6)]"
    onClick={callback}
  >
    Start Game
  </button>
);

export default StartButton;
