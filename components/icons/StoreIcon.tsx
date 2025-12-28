
import React from 'react';

const StoreIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5A.75.75 0 0 1 14.25 12h.01a.75.75 0 0 1 .75.75v7.5m-4.5 0v-7.5A.75.75 0 0 0 9.75 12h-.01a.75.75 0 0 0-.75.75v7.5m-4.5 0v-7.5A.75.75 0 0 0 5.25 12h-.01a.75.75 0 0 0-.75.75v7.5m15-7.5-3-4.5-3 4.5m-4.5-4.5L7.5 12m9 0-.75 1.125" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21.75h16.5a1.5 1.5 0 0 0 1.5-1.5v-6.75a1.5 1.5 0 0 0-1.5-1.5H3.75a1.5 1.5 0 0 0-1.5 1.5v6.75a1.5 1.5 0 0 0 1.5 1.5Z" />
  </svg>
);

export default StoreIcon;