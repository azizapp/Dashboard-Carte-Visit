
import React from 'react';
import { Mode } from '../types.ts';

interface ModeToggleProps {
  mode: Mode;
  setMode: (mode: Mode) => void;
}

const ModeToggle: React.FC<ModeToggleProps> = ({ mode, setMode }) => {
  const isTestMode = mode === Mode.Test;

  const toggleMode = () => {
    setMode(isTestMode ? Mode.Production : Mode.Test);
  };

  return (
    <div className="flex items-center space-x-2">
      <span className={`text-sm font-medium ${isTestMode ? 'text-gray-400' : 'text-green-500'}`}>Production</span>
      <button
        onClick={toggleMode}
        // FIX: Replaced invalid `focusRingColor` style property with the correct Tailwind CSS class `focus:ring-[var(--accent-color)]`.
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-color)] ${isTestMode ? 'bg-[var(--accent-color)]' : 'bg-gray-400'}`}
        role="switch"
        aria-checked={!isTestMode}
      >
        <span
          aria-hidden="true"
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isTestMode ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
       <span className={`text-sm font-medium ${isTestMode ? 'text-[var(--accent-color)]' : 'text-gray-400'}`}>Test</span>
    </div>
  );
};

export default ModeToggle;
