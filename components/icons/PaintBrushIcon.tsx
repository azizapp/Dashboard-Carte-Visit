
import React from 'react';

const PaintBrushIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122l9.37-9.37a2.828 2.828 0 114 4.001l-9.37 9.37a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897zm0 0L7.5 20.5 2 22l1.5-5.5L7.878 12.122m1.122 1.122l1.172-1.172m0 0L11 7.5 15.5 11l-1.172 1.172m-1.172 1.172L11 11" />
  </svg>
);

export default PaintBrushIcon;
