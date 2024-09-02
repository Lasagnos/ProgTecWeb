import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTimeMachine } from './contexts/timeMachineContext';
import { toLocalISOString } from './utilities/utilityFunctions';

import Footer from './partials/footer';
import Header from './partials/header';

const EventWrite = () => {
  axios.defaults.withCredentials = true;
  const navigate = useNavigate(); // 'hook' to navigate to write and edit event
  const { id } = useParams(); // Get the ID from the URL to edit an existing event
  const location = useLocation();
  const { timeMachineDate } = useTimeMachine();

  // Use the passed state or fallback to the time machine date
  const initialStartDate = location.state?.startDate || toLocalISOString(new Date(timeMachineDate)).slice(0, 10); // only the date
  let initialEndDate = location.state?.endDate || toLocalISOString(new Date(timeMachineDate)).slice(0, 10);
  const initialStartTime = new Date(timeMachineDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });  // only the time, without seconds
  const initialEndTime = new Date(new Date(timeMachineDate).setHours(new Date(timeMachineDate).getHours() + 1)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // starting time + 1 hour

  if (initialEndTime < initialStartTime) {  // If the end time crosses midnight
    const endDateObj = new Date(initialEndDate);
    endDateObj.setDate(endDateObj.getDate() + 1); // Increment the end date by one day
    initialEndDate = toLocalISOString(endDateObj).slice(0, 10);
  }

  const [event, setEvent] = useState({  // Default event state
    title: '',
    description: '',
    location: '',
    allDay: false,

    startDate: initialStartDate,
    startTime: initialStartTime,
    endDate: initialEndDate,
    endTime: initialEndTime,

    frequency: 'none',
    customFrequency: {
      type: 'weekly', // Default type
      frequency: 1, // Default frequency

      daysOfWeek: [],
      daysOfMonth: [],
      weekOfMonth: {
        nthWeek: null,
        nthWeekday: null,
      },
      monthsOfYear: [],
    },

    stopRecurrence: 'never',
    stopDate: '',
    stopNumber: '',
  });


  // Fetch the event data when the component is mounted
  useEffect(() => {
    const fetchEventData = async () => {
      if (id) { // Check if we are editing an existing event
        try {
          const response = await axios.get(`http://localhost:5000/api/event/${id}`);
          const eventData = response.data;  // Get the event data from the response

          console.log(eventData); // DEBUG

          const startDateTime = new Date(eventData.start);  // Convert to Date objects
          const endDateTime = new Date(eventData.end);
          const stopDate = eventData.stopDate ? toLocalISOString(new Date(eventData.stopDate)).split('T')[0] : '';
  
          setEvent(prevEvent => ({
            ...prevEvent, 
            ...eventData,
            startDate: toLocalISOString(startDateTime).split('T')[0], // Split date from time
            endDate: toLocalISOString(endDateTime).split('T')[0],
            startTime: startDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),  // Split time from date, slice to remove seconds
            endTime: endDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            stopDate: stopDate,
          }));

        } catch (error) {
          console.error(error);
        }
      }
    };
  
    fetchEventData();
  }, [id]); // The ID is a dependency, so the effect will run whenever it changes

  // Handle changes in the superficial event fields
  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    const newValue = type === 'checkbox' ? checked : // handle allDay checkbox
      (value === null ? '' : value); // handle null values
    setEvent(prevEvent => ({
      ...prevEvent,
      [name]: newValue
    }));
  };


  /* CUSTOM FREQUENCY HANDLING */

  // Handle changes in the event.customfrequency fields
  const handleCustomFrequencyChange = (e) => {
    const { name, value } = e.target;
    setEvent((prevEvent) => ({
      ...prevEvent,
      customFrequency: {
        ...prevEvent.customFrequency,
        [name]: value,
      },
    }));
  };

  // Handle changes in the weekOfMonth fields automatically
  useEffect(() => {
    if (event.customFrequency.type === 'monthly_weekday') {
      const currDate = new Date(event.startDate);
      const nthWeekday = currDate.getDay(); // === 0 ? 6 : currDate.getDay() - 1; // The day of the week of the start date
      const nthWeek = Math.ceil(currDate.getDate() / 7); // The week of the month of the start date
      setEvent((prevEvent) => ({
        ...prevEvent,
        customFrequency: {
          ...prevEvent.customFrequency,
          weekOfMonth: {
            nthWeek,
            nthWeekday,
          },
        },
      }));
    }
  }, [event.startDate, event.customFrequency.type]);

  // Clean up the custom frequency fields based on the selected type
  const cleanCustomFrequencyFields = (customFrequency) => {
    const updatedCustomFrequency = { ...customFrequency };
  
    switch (customFrequency.type) {
      case 'daily':
        updatedCustomFrequency.daysOfWeek = [];
        updatedCustomFrequency.daysOfMonth = [];
        updatedCustomFrequency.weekOfMonth = { nthWeek: null, nthWeekday: null };
        updatedCustomFrequency.monthsOfYear = [];
        break;
      case 'weekly':
        updatedCustomFrequency.daysOfMonth = [];
        updatedCustomFrequency.weekOfMonth = { nthWeek: null, nthWeekday: null };
        updatedCustomFrequency.monthsOfYear = [];
        break;
      case 'monthly':
        updatedCustomFrequency.daysOfWeek = [];
        updatedCustomFrequency.weekOfMonth = { nthWeek: null, nthWeekday: null };
        updatedCustomFrequency.monthsOfYear = [];
        break;
      case 'monthly_weekday':
        updatedCustomFrequency.daysOfWeek = [];
        updatedCustomFrequency.daysOfMonth = [];
        updatedCustomFrequency.monthsOfYear = [];
        break;
      case 'yearly':
        updatedCustomFrequency.daysOfWeek = [];
        updatedCustomFrequency.daysOfMonth = [];
        updatedCustomFrequency.weekOfMonth = { nthWeek: null, nthWeekday: null };
        break;
      default:
        break;
    }
  
    return updatedCustomFrequency;
  };

  // Ensure that at least one day is selected for custom frequency types with a table
  const validateCustomFrequency = (customFrequency) => {
    const { type, daysOfWeek, daysOfMonth, monthsOfYear } = customFrequency;

    // if (frequency < 1) {  // Frequency must be a positive integer
    //   alert('Custom frequency must be at least 1.');
    //   return false;
    // }  // No need - form now avoids values less than 1
  
    switch (type) {
      case 'weekly':
        if (daysOfWeek.length === 0) {
          alert('Please select at least one day of the week.');
          return false;
        }
        break;
      case 'monthly':
        if (daysOfMonth.length === 0) {
          alert('Please select at least one day of the month.');
          return false;
        }
        break;
      case 'yearly':
        if (monthsOfYear.length === 0) {
          alert('Please select at least one month of the year.');
          return false;
        }
        break;
      default:
        break;
    }
  
    return true;
  };

  
  // Handlers for the custom frequency 'array' states

  const handleDayOfWeekClick = (dayIndex) => {
    setEvent((prevEvent) => {
      const daysOfWeek = prevEvent.customFrequency.daysOfWeek.includes(dayIndex)
        ? prevEvent.customFrequency.daysOfWeek.filter((day) => day !== dayIndex)  // deselect
        : [...prevEvent.customFrequency.daysOfWeek, dayIndex];                    // select
      daysOfWeek.sort((a, b) => a - b); // sort
      return {
        ...prevEvent,
        customFrequency: {
          ...prevEvent.customFrequency,
          daysOfWeek, // update the array
        },
      };
    });
  };
  const handleDayOfMonthClick = (day) => {
    setEvent((prevEvent) => {
      const daysOfMonth = prevEvent.customFrequency.daysOfMonth.includes(day)
        ? prevEvent.customFrequency.daysOfMonth.filter((d) => d !== day)
        : [...prevEvent.customFrequency.daysOfMonth, day];
      daysOfMonth.sort((a, b) => a - b);
      return {
        ...prevEvent,
        customFrequency: {
          ...prevEvent.customFrequency,
          daysOfMonth,
        },
      };
    });
  };
  const handleMonthOfYearClick = (monthIndex) => {
    setEvent((prevEvent) => {
      const monthsOfYear = prevEvent.customFrequency.monthsOfYear.includes(monthIndex)
        ? prevEvent.customFrequency.monthsOfYear.filter((month) => month !== monthIndex)
        : [...prevEvent.customFrequency.monthsOfYear, monthIndex];
      monthsOfYear.sort((a, b) => a - b);
      return {
        ...prevEvent,
        customFrequency: {
          ...prevEvent.customFrequency,
          monthsOfYear,
        },
      };
    });
  };

  // Ensure default values are always included and cannot be deselected
  useEffect(() => {
    const defaultDayOfWeek = new Date(event.startDate).getDay() === 0 ? 6 : new Date(event.startDate).getDay() - 1;
    const defaultDayOfMonth = new Date(event.startDate).getDate();
    const defaultMonthOfYear = new Date(event.startDate).getMonth();

    setEvent((prevEvent) => ({
      ...prevEvent,
      customFrequency: {
        ...prevEvent.customFrequency,
        daysOfWeek: prevEvent.customFrequency.daysOfWeek.includes(defaultDayOfWeek)
          ? prevEvent.customFrequency.daysOfWeek
          : [...prevEvent.customFrequency.daysOfWeek, defaultDayOfWeek],
        daysOfMonth: prevEvent.customFrequency.daysOfMonth.includes(defaultDayOfMonth)
          ? prevEvent.customFrequency.daysOfMonth
          : [...prevEvent.customFrequency.daysOfMonth, defaultDayOfMonth],
        monthsOfYear: prevEvent.customFrequency.monthsOfYear.includes(defaultMonthOfYear)
          ? prevEvent.customFrequency.monthsOfYear
          : [...prevEvent.customFrequency.monthsOfYear, defaultMonthOfYear],
      },
    }));
  }, [event.startDate]);


  // Render tables for selecting days of the week, days of the month and months of the year in custom frequency

  const renderWeekDaySelector = () => {
    const weekdays = [
      { name: 'Mon', index: 0 },
      { name: 'Tue', index: 1 },
      { name: 'Wed', index: 2 },
      { name: 'Thu', index: 3 },
      { name: 'Fri', index: 4 },
      { name: 'Sat', index: 5 },
      { name: 'Sun', index: 6 }
    ];

    let defaultDayOfWeek = new Date(event.startDate).getDay() === 0 ? 6 : new Date(event.startDate).getDay() - 1;

    const rows = [];
    for (let i = 0; i < weekdays.length; i += 4) {
      rows.push(weekdays.slice(i, i + 4));  // Split weekdays into 2 rows of 4
    }
  
    return (
      <table className="table table-bordered">
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((day, colIndex) => (
                <td
                  key={colIndex}
                  className={`text-center ${event.customFrequency.daysOfWeek.includes(day.index) ? 'bg-primary text-white' : ''}`}
                  onClick={() => day.index !== defaultDayOfWeek && handleDayOfWeekClick(day.index)}
                  style={{ cursor: 'pointer' }}
                >
                  {day.name}
                </td>
              ))}
              {row.length < 4 && Array.from({ length: 4 - row.length }).map((_, colIndex) => (
                <td key={colIndex + row.length} className="text-center"></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderMonthDaySelector = () => {
    const days = Array.from({ length: 31 }, (_, i) => i + 1); // 31 days

    const defaultDayOfMonth = new Date(event.startDate).getDate();

    const rows = [];
    for (let i = 0; i < days.length; i += 7) {
      rows.push(days.slice(i, i + 7));  // Split days into rows of 7
    }
  
    return (
      <table className="table table-bordered table-striped">
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((day, colIndex) => (
                <td
                  key={colIndex}
                  className={`text-center  ${event.customFrequency.daysOfMonth.includes(day) ? 'bg-primary text-white' : ''}`}
                  onClick={() => day !== defaultDayOfMonth && handleDayOfMonthClick(day)}
                  style={{ cursor: 'pointer' }}
                >
                  {day}
                </td>
              ))}
              {row.length < 7 && Array.from({ length: 7 - row.length }).map((_, colIndex) => (
                <td key={colIndex + row.length} className="text-center"></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderYearlyMonthSelector = () => {
    const months = [
      { name: 'Jan', index: 0 },
      { name: 'Feb', index: 1 },
      { name: 'Mar', index: 2 },
      { name: 'Apr', index: 3 },
      { name: 'May', index: 4 },
      { name: 'Jun', index: 5 },
      { name: 'Jul', index: 6 },
      { name: 'Aug', index: 7 },
      { name: 'Sep', index: 8 },
      { name: 'Oct', index: 9 },
      { name: 'Nov', index: 10 },
      { name: 'Dec', index: 11 }
    ];

    const defaultMonthOfYear = new Date(event.startDate).getMonth();

    const rows = [];
    for (let i = 0; i < months.length; i += 4) {
      rows.push(months.slice(i, i + 4));  // Split months into 3 rows of 4
    }

    return (
      <table className="table table-bordered table-striped">
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((month, colIndex) => (
                <td
                  key={colIndex}
                  className={`text-center ${event.customFrequency.monthsOfYear.includes(month.index) ? 'bg-primary text-white' : ''}`}
                  onClick={() => month.index !== defaultMonthOfYear && handleMonthOfYearClick(month.index)}
                  style={{ cursor: 'pointer' }}
                >
                  {month.name}
                </td>
              ))}
              {row.length < 4 && Array.from({ length: 4 - row.length }).map((_, colIndex) => (
                <td key={colIndex + row.length} className="text-center"></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // Custom frequency specifications
  const firstWeekday = (date) => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayIndex = date.getDay();
    return daysOfWeek[dayIndex];
  };
  const firstMonth = (date) => {
    const monthsOfYear = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthIndex = date.getMonth();
    return monthsOfYear[monthIndex];
  };
  const startingDate = new Date(event.startDate);
  const startingWeekday = firstWeekday(startingDate);
  const startingDay = startingDate.getDate();
  const startingMonth = firstMonth(startingDate);
  


  /* SUBMIT AND VALIDATE */

  const handleSubmit = async (e) => {
    e.preventDefault(); // Avoid page refresh
  
    // Validate and prepare data before submission
    const validatedEvent = validateAndPrepareData(event);
    if (!validatedEvent) {
      return;
    }
  
    try {
      let response; // Declared here to be used outside the try-catch block

      if (id) { // If there is an ID, update the existing event
        response = await axios.put(`http://localhost:5000/api/event/write/${id}`, validatedEvent);
      } else { // Otherwise, create the new event
        response = await axios.post('http://localhost:5000/api/event/write', validatedEvent);
      }
      if (response.status === 200) {
        navigate('/calendar');  // Navigate to the calendar page after the event is created or updated
      }

    } catch (error) {
      console.error(error);
    }
  };


  const validateAndPrepareData = (event) => {
    let validatedEvent = { ...event }; //copy

    // Fuse date and time into a single Date object
    let start = validatedEvent.allDay ? new Date(validatedEvent.startDate) :
      new Date(validatedEvent.startDate + 'T' + validatedEvent.startTime);
    let end;
    if (validatedEvent.allDay) {
      end = new Date(validatedEvent.endDate);
      end.setHours(23, 59, 59, 999); // Set to 23:59:59.999 of the same day
    } else {
      end = new Date(validatedEvent.endDate + 'T' + validatedEvent.endTime);
    }
    // The event in the database will appear one hour earlier than expected because of the timezone difference...
    // But the displayed time and its handling is correct.
  
    // Check if end is after start
    if (validatedEvent.allDay) {
      if (end < start) {  // For allDay events, only compare dates. Can be the same.
        alert('The end of the event must be after its start!');
        return null;
      }
    } else {
      if (end <= start) { // For non-allDay events, compare date and time. Must be a later time.
        alert('The end of the event must be after its start!');
        return null;
      }
    }

    // Handle custom frequency data
    if (validatedEvent.frequency === 'custom') {
      if (!validateCustomFrequency(validatedEvent.customFrequency)) {
        return null;  // Stop if the custom frequency is invalid
      }
      // Reset the custom frequency fields based on the selected type
      validatedEvent.customFrequency = cleanCustomFrequencyFields(validatedEvent.customFrequency);
    }
    else {  // Reset the custom frequency fields if the frequency is not 'custom'
      const defaultCustomFrequency = {
        type: 'weekly',
        frequency: 1,
        daysOfWeek: [],
        daysOfMonth: [],
        weekOfMonth: {
          nthWeek: null,
          nthWeekday: null,
        },
        monthsOfYear: [],
      };
      validatedEvent.customFrequency = defaultCustomFrequency;
    }


    
    // Value preparation for stopRecurrence, stopDate, and stopNumber.
    // Ensures the data is consistent.
    if (validatedEvent.frequency === 'none') {
      validatedEvent.stopRecurrence = 'never';
    }
    switch (validatedEvent.stopRecurrence) {
      case 'never':
        validatedEvent.stopDate = '';
        validatedEvent.stopNumber = '';
        break;
      case 'date':
        validatedEvent.stopNumber = '';
        if (validatedEvent.stopDate < validatedEvent.endDate) {
          alert('The stop date must be after the end of the event!');
          return null;
        }
        break;
      case 'number':
        validatedEvent.stopDate = '';
        break;
      default:
        break;
    }


    // Prepare the event data object
    const eventData = {
      ...validatedEvent,
      start,
      end,
    };
  
    return eventData;
  };


  return (
    <>
    <Header />
    <form onSubmit={handleSubmit} className="container mt-4">
      <div className="mb-3">
        <label htmlFor="title" className="form-label">Title</label>
        <input type="text" name="title" value={event.title} onChange={handleChange} className="form-control" id="title" required/>
      </div>
      <div className="mb-3">
        <label htmlFor="description" className="form-label">Description</label>
        <textarea name="description" value={event.description} onChange={handleChange} className="form-control" id="description" />
      </div>
      <div className="mb-3">
        <label htmlFor="location" className="form-label">Location</label>
        <input type="text" name="location" value={event.location} onChange={handleChange} className="form-control" id="location" />
      </div>

      {/* <hr className="my-4" style={{ borderColor: 'gray' }} /> */}

      <div className="mb-3 form-check d-flex justify-content-center align-items-center">
        <input type="checkbox" name="allDay" checked={event.allDay} onChange={handleChange} className="form-check-input" id="allDay" />
        <label className="form-check-label mx-1" htmlFor="allDay">All Day</label>
      </div>

      <div className="row mb-3">
        <div className="col-md-6 d-flex flex-column align-items-center">
          <div className="d-flex align-items-center mb-2">
            <label htmlFor="startDate" className="form-label me-2">Start Date:</label>
            <input type="date" name="startDate" value={event.startDate} onChange={handleChange} className="form-control w-auto" id="startDate" required />
          </div>
          {!event.allDay && (
            <div className="d-flex align-items-center mb-2">
              <label htmlFor="startTime" className="form-label me-2">Start Time:</label>
              <input type="time" name="startTime" value={event.startTime} onChange={handleChange} className="form-control w-auto" id="startTime" />
            </div>
          )}
        </div>
        <div className="col-md-6 d-flex flex-column align-items-center">
          <div className="d-flex align-items-center mb-2">
            <label htmlFor="endDate" className="form-label me-2">End Date:</label>
            <input type="date" name="endDate" value={event.endDate} onChange={handleChange} className="form-control w-auto" id="endDate" required />
          </div>
          {!event.allDay && (
            <div className="d-flex align-items-center mb-2">
              <label htmlFor="endTime" className="form-label me-2">End Time:</label>
              <input type="time" name="endTime" value={event.endTime} onChange={handleChange} className="form-control w-auto" id="endTime" />
            </div>
          )}
        </div>
      </div>


      <hr className="my-4" style={{ borderColor: 'gray' }} />

      <div className="mb-4 d-flex flex-column flex-lg-row align-items-center">
        <div className="me-3 mb-2 d-flex align-items-center flex-grow-1 justify-content-center">
          <label htmlFor="frequency" className="form-label me-2 mb-0">Frequency:</label>
          <select name="frequency" value={event.frequency} onChange={handleChange} className="form-select w-auto" id="frequency">
            <option value="none">None</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="monthly_weekday">Monthly by Weekday</option>
            <option value="yearly">Yearly</option>
            <option value="custom">CUSTOM</option>
          </select>
        </div>

        {event.frequency !== 'none' && (
          <>
            <div className="d-flex align-items-center flex-grow-1 justify-content-center mb-2">
              <label htmlFor="stopRecurrence" className="form-label me-2 mb-0">Stop Recurrence:</label>
              <select name="stopRecurrence" value={event.stopRecurrence} onChange={handleChange} className="form-select w-auto" id="stopRecurrence">
                <option value="never">Never</option>
                <option value="date">After a certain date</option>
                <option value="number">After a number of times</option>
              </select>
            </div>

            {event.stopRecurrence === 'date' && (
              <div className="d-flex align-items-center flex-grow-1 justify-content-center mb-2">
                <label htmlFor="stopDate" className="form-label me-2 mb-0">Stop Date:</label>
                <input type="date" name="stopDate" value={event.stopDate || ""} onChange={handleChange} required className="form-control w-auto" id="stopDate"/>
              </div>
            )}

            {event.stopRecurrence === 'number' && (
              <div className="d-flex align-items-center flex-grow-1 justify-content-center mb-2">
                <label htmlFor="stopNumber" className="form-label me-2 mb-0">Total occurrences:</label>
                <input type="number" name="stopNumber" value={event.stopNumber || ""} onChange={handleChange} required className="form-control w-auto" id="stopNumber" min="1"/>
              </div>
            )}
          </>
        )}
      </div>

      {/* Nested custom frequency form */}
      {event.frequency === 'custom' && (
        <>
        <div>
          <div className="row mb-4">
            <div className="col-lg-6 d-flex align-items-center justify-content-center mb-2">  {/* Custom frequency type selector */}
              <label htmlFor="type" className="form-label me-2 mb-0">Frequency Type:</label>
              <select name="type" value={event.customFrequency.type} onChange={handleCustomFrequencyChange} className="form-select w-auto" id="customFrequency.type">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="monthly_weekday">Monthly by Weekday</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div className="col-lg-6 d-flex flex-column flex-md-row align-items-center justify-content-center">  {/* Custom frequency input */}
              <label htmlFor="frequency" className="form-label me-2 mb-0">Repeat every</label>
              <input type="number" name="frequency" value={event.customFrequency.frequency} onChange={handleCustomFrequencyChange} className="form-control me-2 w-auto" id="frequency" min="1"/>
              <span>
                {event.customFrequency.type === 'daily' ? 'days' : event.customFrequency.type === 'weekly' ? 'weeks' : event.customFrequency.type === 'monthly' || event.customFrequency.type === 'monthly_weekday' ? 'months' : 'years'}
              </span>
            </div>
          </div>

          {event.customFrequency.type === 'weekly' && (
            <div>
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
                <label htmlFor="daysOfWeek" className="form-label">Select days of the week:</label>
                <div className="d-none d-md-block">
                  {startingWeekday && (
                    <p className="text-muted mb-0">The starting weekday, {startingWeekday}, is locked</p>
                  )}
                </div>
              </div>
              {renderWeekDaySelector()}
              <div className="d-block d-md-none">  {/* Locked info shown below the table for small screens */}
                {startingWeekday && (
                  <p className="text-muted text-center mb-0">The starting weekday, {startingWeekday}, is locked</p>
                )}
              </div>
            </div>
          )}

          {event.customFrequency.type === 'monthly' && (
            <div>
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
                <label htmlFor="daysOfMonth" className="form-label">Select days of the month:</label>
                <div className="d-none d-md-block">
                  {startingDay && (
                    <p className="text-muted mb-0">The starting date, {startingDay}, is locked</p>
                  )}
                </div>
              </div>
              {renderMonthDaySelector()}
              <div className="d-block d-md-none mt-2">
                {startingDay && (
                  <p className="text-muted text-center mb-0">The starting date, {startingDay}, is locked</p>
                )}
              </div>
            </div>
          )}

          {event.customFrequency.type === 'monthly_weekday' && (
            <div className='text-center text-muted'>
              <p>
                The event will recur on the 
                {` ${event.customFrequency.weekOfMonth.nthWeekday === 0 ? 'last' : event.customFrequency.weekOfMonth.nthWeekday === 1 ? 'first' : event.customFrequency.weekOfMonth.nthWeekday === 2 ? 'second' : event.customFrequency.weekOfMonth.nthWeekday === 3 ? 'third' : 'fourth'} `}
                {` ${firstWeekday(new Date(event.startDate))} `}
                of the month.
              </p>
            </div>
          )}

          {event.customFrequency.type === 'yearly' && (
            <div>
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
                <label htmlFor="monthsOfYear" className="form-label">Select Months of the Year:</label>
                <div className="d-none d-md-block">
                  {startingMonth && (
                    <p className="text-muted mb-0">The starting month, {startingMonth}, is locked</p>
                  )}
                </div>
              </div>
              {renderYearlyMonthSelector()}
              <div className="d-block d-md-none mt-2">
                {startingMonth && (
                  <p className="text-muted text-center mb-0">The starting month, {startingMonth}, is locked</p>
                )}
              </div>
            </div>
          )}
        </div>

        <hr className="my-3" style={{ borderColor: 'gray' }} />
        </>
      )}


      

      <div className="d-flex justify-content-center my-4">
        <button type="submit" className="btn btn-primary btn-lg text-center">Submit</button>
      </div>
    </form>
    <Footer />
    </>
  );
};

export default EventWrite;