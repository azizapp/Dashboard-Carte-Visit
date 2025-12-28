
import React from 'react';

const MessageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.722.267c-.597.043-1.152.26-1.59.592l-2.116 2.116c-.42.42-1.092.42-1.512 0l-2.116-2.116a3.11 3.11 0 0 0-1.59-.592l-3.722-.267A2.109 2.109 0 0 1 2.25 14.894V10.608c0-.97.616-1.813 1.5-2.097m16.5 0a2.121 2.121 0 0 0-1.5-2.097L16.5 6.25a2.121 2.121 0 0 0-2.121-2.121L12 2.25l-2.379 1.88a2.121 2.121 0 0 0-2.121 2.121l-.267 3.722a2.121 2.121 0 0 0 1.5 2.097m16.5 0-3.26-3.26a2.121 2.121 0 0 0-2.999 2.999l3.26 3.26a2.121 2.121 0 0 0 2.999-2.999Z" />
  </svg>
);

export default MessageIcon;
