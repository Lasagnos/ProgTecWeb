import React, { createContext, useContext, useState, useEffect } from 'react';

// The timemachine is on a context for the entire app
const TimeMachineContext = createContext();
export const useTimeMachine = () => useContext(TimeMachineContext); // What to import


export const TimeMachineProvider = ({ children }) => {
  // Initialize the timeMachineDate's state with the already present localStorage value
  // If absent, use the current system datetime
  const [timeMachineDate, setTimeMachineDate] = useState(() => {
    const savedDate = localStorage.getItem('timeMachineDate');
    return savedDate ? new Date(savedDate) : new Date();
  });

  // Increment the timeMachineDate by one second, every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeMachineDate((prevDate) => {
        const newDate = new Date(prevDate.getTime() + 1000);
        localStorage.setItem('timeMachineDate', newDate); // Save the changed date to localStorage
        return newDate;
      });
    }, 1000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  // Reset the timeMachineDate to the current system datetime
  const resetTimeMachineDate = () => {
    const currentDate = new Date();
    localStorage.setItem('timeMachineDate', currentDate);
    setTimeMachineDate(currentDate);
  };
  // Set the timeMachineDate to the date passed as an argument
  const changeTimeMachineDate = (date) => {
    const newDate = new Date(date);
    if (isNaN(newDate.getTime())) { // Safeguard
      //console.error('DEBUG - Invalid date!');
      return;
    }
    localStorage.setItem('timeMachineDate', newDate);
    setTimeMachineDate(newDate);
  };

  return (
    <TimeMachineContext.Provider value={{ timeMachineDate, setTimeMachineDate, resetTimeMachineDate, changeTimeMachineDate }}>
      {children}
    </TimeMachineContext.Provider>
  );
};