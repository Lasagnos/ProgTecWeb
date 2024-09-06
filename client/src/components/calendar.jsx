import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTimeMachine } from './contexts/timeMachineContext';
import Header from './partials/header';
import Footer from './partials/footer';
import { toLocalISOString, expandRecurringEvents } from './utilities/utilityFunctions';
import Event from './partials/event';

const Calendar = () => {
  axios.defaults.withCredentials = true;
  const navigate = useNavigate();
  const { timeMachineDate } = useTimeMachine();
  
  const currentDay = timeMachineDate.getDate();
  const currentMonth = timeMachineDate.getMonth();
  const currentYear = timeMachineDate.getFullYear();

  const [selectedDay, setSelectedDay] = useState(currentDay);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const [viewMode, setViewMode] = useState('month'); // 'month' or 'year' view
  const [rows, setRows] = useState([]); // Holds the days shown in the calendar, grouped by row
  const [tempDate, setTempDate] = useState(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`);
  
  const [events, setEvents] = useState([]); // Holds all events
  const [filteredEvents, setFilteredEvents] = useState([]); // State to hold events for the selected date

  // String of the time machine's date part. Used to fetch events.
  const [timeMachineDateString, setTimeMachineDateString] = useState(toLocalISOString(timeMachineDate).split('T')[0]);
  useEffect(() => {
    setTimeMachineDateString(toLocalISOString(timeMachineDate).split('T')[0]);
  }, [timeMachineDate]);

  
  // Fetch events on component mount and when the time machine date changes
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/event');
        const events = response.data;

        const expandedEvents = expandRecurringEvents(events, timeMachineDateString);
        setEvents(expandedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, [timeMachineDateString]);

  // Filter events based on the selected date
  useEffect(() => {
    const selectedDate = toLocalISOString(new Date(selectedYear, selectedMonth, selectedDay)).split('T')[0];
  
    const filtered = events.filter(event => { // Show only events between start and end date
      const eventStartDate = toLocalISOString(new Date(event.start)).split('T')[0];
      const eventEndDate = toLocalISOString(new Date(event.end)).split('T')[0];
      return selectedDate >= eventStartDate && selectedDate <= eventEndDate;
    });
  
    setFilteredEvents(filtered);
  }, [selectedDay, selectedMonth, selectedYear, events]);


  // Utility functions

  // Get the number of days in a month
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();  // The 0th day of the next month is the last day of the current month
  };
  // Get the first weekday of the month (starting from monday)
  const getFirstDayOfMonth = (month, year) => {
    const day = new Date(year, month, 1).getDay();
    return (day === 0 ? 6 : day - 1); // sunday (0) is set as the last day of the week, the rest scales down by 1
    //return day
  };

  
  // Handler for selecting a new day
  const handleDayClick = useCallback((day, monthOffset) => {
    setSelectedMonth((prevMonth) => {
      let newMonth = prevMonth + monthOffset;
      let newYear = selectedYear;
  
      if (newMonth < 0) {
        newMonth = 11;  // December
        newYear -= 1;
      } else if (newMonth > 11) {
        newMonth = 0;   // January
        newYear += 1;
      }
  
      setSelectedYear(newYear);
      return newMonth;
    });
  
    setSelectedDay(day);
  }, [selectedYear]);


  /* RENDERING THE CALENDAR */

  const renderDayCell = useCallback((day, monthOffset) => {
    const currentDate = toLocalISOString(new Date(selectedYear, selectedMonth + monthOffset, day)).split('T')[0];
    
    // info flags for highlighting the selected day and month
    const isSelectedDay = day === selectedDay && monthOffset === 0;
    const isCurrentMonth = monthOffset === 0;
    
    // Single day event
    const hasSingleDayEvent = events.some(event => {  
      const eventStartDate = toLocalISOString(new Date(event.start)).split('T')[0];
      const eventEndDate = toLocalISOString(new Date(event.end)).split('T')[0];
      return eventStartDate === currentDate && eventEndDate === currentDate;
    });
    // Multi day event
    const hasMultiDayEvent = events.some(event => {
      const eventStartDate = toLocalISOString(new Date(event.start)).split('T')[0];
      const eventEndDate = toLocalISOString(new Date(event.end)).split('T')[0];
      return currentDate >= eventStartDate && currentDate <= eventEndDate && eventStartDate !== eventEndDate;
    });
  
    return (
      <div key={`${monthOffset}-${day}`}
        className={`col border p-3 ${isSelectedDay ? 'bg-primary text-white' : ''} ${isCurrentMonth ? 'hoverCurr' : 'hoverAlt'}`}  // Highlight the selected day
        onClick={() => handleDayClick(day, monthOffset)}
        style={{ cursor: 'pointer', position: 'relative' }}
      >
        {day}
        {hasSingleDayEvent && <div className="calendarDot text-primary"></div>}
        {hasMultiDayEvent && <div className="calendarLine text-primary"></div>}
      </div>  // Dot for single day event, line for multi day event
    );
  }, [selectedYear, selectedMonth, selectedDay, events, handleDayClick]);

  
  // Render the calendar when the selected day changes
  useEffect(() => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDayOfMonth = getFirstDayOfMonth(selectedMonth, selectedYear);
    const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
    const daysInPrevMonth = getDaysInMonth(prevMonth, selectedYear);
  
    const newDays = []; // Holds all the days shown. Will be grouped in rows
  
    // Add the days of the previous month, starting from the last days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      newDays.push(renderDayCell(daysInPrevMonth - i, -1));
    }
    // Add the days of the current month
    for (let i = 1; i <= daysInMonth; i++) {
      newDays.push(renderDayCell(i, 0));
    }
    // Add the days of the next month
    const totalCells = firstDayOfMonth + daysInMonth;   // Total cells in the calendar
    const emptyCellsAtEnd = (7 - (totalCells % 7)) % 7; // Empty cells at the end
    for (let i = 1; i <= emptyCellsAtEnd; i++) {
      newDays.push(renderDayCell(i, 1));
    }
  
    // Groups the days into rows of 7
    const newRows = [];
    for (let i = 0; i < newDays.length; i += 7) {
      newRows.push(
        <div className="row" key={`row-${i / 7}`}>
          {newDays.slice(i, i + 7)}
        </div>
      );
    }
  
    setRows(newRows);
  }, [selectedDay, selectedMonth, selectedYear, events, renderDayCell]);



  // Names arrays
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  //const shortenedMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Utility to check if a date is valid
  const isValidDate = (day, month, year) => {
    const date = new Date(year, month, day);
    return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day;
  };

  // Temporary date for jump change handler
  const handleTempDateChange = (event) => {
    setTempDate(event.target.value);
  };
  // Date jump handler
  const handleDateJump = () => {
    const newDate = new Date(tempDate);
    if (!isNaN(newDate)) {
      setViewMode('month');
      setSelectedDay(newDate.getDate());
      setSelectedMonth(newDate.getMonth());
      setSelectedYear(newDate.getFullYear());
    }
  };


  /* BUTTON HANDLERS */

  const handleTitleClick = () => {
    setViewMode(viewMode === 'month' ? 'year' : 'month');
    setSelectedDay(null); // Deselect the day
  };

  const handleMonthClick = (month) => {
    setSelectedMonth(month);
    setViewMode('month');
  };

  const handlePrevClick = () => {
    if (viewMode === 'month') {
      setSelectedMonth((prevMonth) => {
        let newMonth = prevMonth - 1;
        let newYear = selectedYear;

        if (newMonth < 0) {
          newMonth = 11;  // December
          newYear -= 1;
        }

        setSelectedYear(newYear);
        return newMonth;
      });
    } else {
      setSelectedYear((prevYear) => prevYear - 1);
    }
  };

  const handleNextClick = () => {
    if (viewMode === 'month') {
      setSelectedMonth((prevMonth) => {
        let newMonth = prevMonth + 1;
        let newYear = selectedYear;

        if (newMonth > 11) {
          newMonth = 0;   // January
          newYear += 1;
        }

        setSelectedYear(newYear);
        return newMonth;
      });
    } else {
      setSelectedYear((prevYear) => prevYear + 1);
    }
  };

  const handleAddEventClick = () => {
    const selectedDate = toLocalISOString(new Date(selectedYear, selectedMonth, selectedDay)).split('T')[0];
    navigate(`/event/write`, { state: { startDate: selectedDate, endDate: selectedDate } });
  };

  const handleJumpToToday = () => {
    const today = new Date(timeMachineDate);
    setViewMode('month');
    setSelectedDay(today.getDate());
    setSelectedMonth(today.getMonth());
    setSelectedYear(today.getFullYear());
  };


  /* EVENT BUTTONS */

  // const handleEventUpdate = (updatedEvent) => {  // No need
  //   // Update the event in the state by replacing the event by its id
  //   setEventsOld(eventsOld.map(event => event._id === updatedEvent._id ? updatedEvent : event));
  // };
  const handleEventDelete = (eventId) => {
    setEvents(events.filter(event => event._id !== eventId)); // Remove the event from the state
  };


  return (
    <>
    <Header />
    <div className="container mt-5">
      <div className="row">
        <div className="col text-center">

        <div className="d-flex align-items-center justify-content-center mb-3">
          <i className="fa fa-arrow-left mx-2" onClick={handlePrevClick} style={{ cursor: 'pointer', fontSize: '1.5rem' }}></i>
          <h2 onClick={handleTitleClick} style={{ cursor: 'pointer', width: '300px' }}>
            {viewMode === 'month' ? `${monthNames[selectedMonth]} ${selectedYear}` : selectedYear}
          </h2>
          <i className="fa fa-arrow-right mx-2" onClick={handleNextClick} style={{ cursor: 'pointer', fontSize: '1.5rem' }}></i>
        </div>

          {viewMode === 'month' ? ( // Days in a month
            <>
              <div className="row">
                {weekdays.map((day, index) => (
                  <div key={index} className="col border p-2 p-md-3 weekdays">
                    <strong>{day}</strong>
                  </div>
                ))}
              </div>
              {rows}
            </>
          ) : (                     // Months in a year
            <div className="container">
              <div className="row no-gutters">
                {monthNames.map((month, index) => (
                  <div key={index} className="col-4 col-md-3 p-1" style={{ fontSize: "1.2rem"}}>
                    <div
                      className={`border p-2 p-md-4 text-center ${index === selectedMonth ? 'bg-primary text-white' : ''} hoverCurr`}
                      onClick={() => handleMonthClick(index)}
                      style={{ cursor: 'pointer' }}
                    >
                      {month}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
      
      <div className="d-flex align-items-center justify-content-center m-4 flex-column flex-md-row">
        <form className="d-flex align-items-center mb-3 mb-md-0"> 
          <label htmlFor="jumpToDate" className="form-label me-2 mb-0">Jump to Date:</label>
          <div className="btn-group">
            <input type="date" id="jumpToDate"
              className="form-control"
              value={tempDate} onChange={handleTempDateChange}
            />
            <button type="button" className="btn btn-primary" onClick={handleDateJump}>Jump</button>
          </div>
        </form>
        <button type="button" className="btn btn-primary ms-md-5" onClick={handleJumpToToday}>Jump to today</button>
      </div>

      <hr style={{ borderColor: 'gray' }} />
      
      {isValidDate(selectedDay, selectedMonth, selectedYear) ? (

        <div className="m-4">
          <div className="d-flex justify-content-between align-items-center">
            <h2>Events on {`${selectedDay}/${selectedMonth + 1}/${selectedYear}`}:</h2>
            <button className="btn btn-primary mb-3" onClick={handleAddEventClick}>
              <i className="fa fa-plus" aria-hidden="true"></i> Add Event
            </button>
          </div>
          
          
          {filteredEvents.length > 0 ? (
            <div className="row row-cols-1 row-cols-md-3 g-4 mx-0 mb-2">
              {filteredEvents.map(event => (
                <Event key={event._id} event={event} onEventDelete={handleEventDelete}/>
              ))}
            </div>
          ) : (
            <p>No events for this date.</p>
          )}
      </div>

      ) : null }

    </div>
    <Footer />
    </>
  );
};

export default Calendar;