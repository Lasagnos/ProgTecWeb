import React, { useState } from 'react';
import { useTimeMachine } from '../contexts/timeMachineContext';

// Shows the timemachine

const Footer = () => {
  const { timeMachineDate, changeTimeMachineDate } = useTimeMachine();
  const [isEditing, setIsEditing] = useState(false);  // If editing, shows the datetime input field

  // Changes the datetime to the one selected by the user
  const handleDateChange = (event) => {
    changeTimeMachineDate(event.target.value);
    setIsEditing(false);
  };

  // Resets the datetime to the current system datetime
  const resetToCurrentDate = () => {
    changeTimeMachineDate(new Date());
  };

  // Utility to handle timezone offset
  const toLocalISOString = (date) => {
    const offset = date.getTimezoneOffset() * 60000; // Get the offset in milliseconds
    const adjustedDate = new Date(date.getTime() - offset); // Get the correct date
    return adjustedDate.toISOString().slice(0, 16);
  };

  return (
    <footer className="footer bg-dark d-flex justify-content-center align-items-center p-3">
      <div className="me-3" style={{ cursor: 'pointer' }}>
        {isEditing ? (
          <input type="datetime-local" defaultValue={toLocalISOString(timeMachineDate)} onBlur={handleDateChange} autoFocus />
        ) : (
          <p className="mb-0 text-light" onMouseEnter={(e) => e.target.classList.add('text-decoration-underline')} onMouseLeave={(e) => e.target.classList.remove('text-decoration-underline')} onClick={() => setIsEditing(true)}>{timeMachineDate.toLocaleString()}</p>
        )}
      </div>
      <span className="mb-0 text-light" style={{ cursor: 'pointer' }} onMouseEnter={(e) => e.target.classList.add('text-decoration-underline')} onMouseLeave={(e) => e.target.classList.remove('text-decoration-underline')} onClick={resetToCurrentDate}>Reset Time Machine</span>
    </footer>
  );
};

export default Footer;