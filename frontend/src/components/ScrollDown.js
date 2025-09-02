import React from 'react';

const ScrollDown = ({ onClick }) => {
  return (
    <div className="scroll-down" onClick={onClick}>
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M19 12l-7 7-7-7"/>
      </svg>
    </div>
  );
};

export default ScrollDown;