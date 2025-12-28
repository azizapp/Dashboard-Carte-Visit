
import React from 'react';

interface ConnectionStatusIconProps {
  connected: boolean;
}

const ConnectionStatusIcon: React.FC<ConnectionStatusIconProps> = ({ connected }) => {
  const title = connected ? "Connected to Google Sheets" : "Connection failed, using local data";
  const colorClass = connected ? "text-green-500" : "text-red-500";

  return (
    <div title={title}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={`w-6 h-6 ${colorClass} transition-colors duration-300`}
        aria-label={title}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.136 12.006a8.25 8.25 0 0 1 13.728 0M2 8.974a12 12 0 0 1 20 0m-8.254 9.112.022.022L12 21.01l-1.768-1.768a.75.75 0 0 1 1.06-1.06Z"
        />
      </svg>
    </div>
  );
};

export default ConnectionStatusIcon;
