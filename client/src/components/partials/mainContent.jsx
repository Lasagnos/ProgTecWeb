import React from 'react';

const MainContent = ({ children }) => {
  return (
    <div style={{ paddingBottom: '60px' }}>
      {children}
    </div>
  );
};

export default MainContent;

/*
The MainContent component is a functional component that gives a padding-bottom of 60px to its children.
This is to ensure that the fixed footer does not overlap the content.
*/