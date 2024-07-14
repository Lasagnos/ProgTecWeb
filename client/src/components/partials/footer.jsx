import React from 'react';

// In the future, this component will display the time machine
// and all dates and times will be based on it instead of the local time

const Footer = () => {
  return (
    <footer className="footer bg-light d-flex justify-content-center align-items-center p-3">
      <p className="mb-0">00:00</p>
    </footer>
  );
};

export default Footer;