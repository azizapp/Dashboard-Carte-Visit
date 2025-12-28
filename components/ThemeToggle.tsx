import React from 'react';

type Theme = 'light' | 'dark';

interface ThemeToggleProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, setTheme }) => {
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const isDarkMode = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-color)] focus:ring-offset-white dark:focus:ring-offset-slate-800 ${
        isDarkMode ? 'bg-[var(--accent-color)]' : 'bg-slate-200 dark:bg-slate-700'
      }`}
      role="switch"
      aria-checked={isDarkMode}
      title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      <span
        aria-hidden="true"
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          isDarkMode ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
};

export default ThemeToggle;
