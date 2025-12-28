
import React from 'react';

const CogIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 1 1 15 0 7.5 7.5 0 0 1-15 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25v1.5m0 16.5v1.5M2.25 12h1.5m16.5 0h1.5m-1.5-7.5-1.06 1.06M6.31 17.69l-1.06 1.06m12.44 0-1.06-1.06M6.31 6.31 5.25 5.25" />
  </svg>
);

export default CogIcon;
