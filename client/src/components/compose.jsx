import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

import Footer from './partials/footer';
import Header from './partials/header';

const Compose = () => {
  axios.defaults.withCredentials = true;
  const navigate = useNavigate(); // 'hook' to navigate to compose and edit event
  const { id } = useParams(); // Get the ID from the URL to edit an existing event
  const [event, setEvent] = useState({
    title: '',
    description: '',
    location: '',
    allDay: false,
    
    //Dates and times are all messy since they use local times. Will be fixed with the time machine. 
    startDate: new Date().toISOString().split('T')[0],  
    startTime: '00:00',   // in the future, change to current time               
    endDate: new Date().toISOString().split('T')[0],
    endTime: '00:00',     // in the future, change to current time + 1 hour
  
    frequency: 'none',
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
  
          setEvent(prevEvent => {
            // Check for undefined properties and set them to their default values
            for (let key in prevEvent) {
              if (eventData[key] === undefined) {
                eventData[key] = prevEvent[key];
              }
            }
  
            // Convert the start and end dates, along the stopDate to the format used in the form
            // Glitchy! Will be fixed with the time machine.
            if (eventData.start) {
              const startDate = new Date(eventData.start);
              eventData.startDate = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())).toISOString().split('T')[0];
              eventData.startTime = startDate.toTimeString().split(' ')[0].substring(0, 5);
            }
            if (eventData.end) {
              const endDate = new Date(eventData.end);
              eventData.endDate = new Date(Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())).toISOString().split('T')[0];
              eventData.endTime = endDate.toTimeString().split(' ')[0].substring(0, 5);
            }
            if (eventData.stopDate) {
              const stopDate = new Date(eventData.stopDate);
              eventData.stopDate = new Date(Date.UTC(stopDate.getFullYear(), stopDate.getMonth(), stopDate.getDate())).toISOString().split('T')[0];
              eventData.stopTime = stopDate.toTimeString().split(' ')[0].substring(0, 5);
            }
  
            return eventData; // Return the updated event data
          });
        } catch (error) {
          console.error(error);
        }
      }
    };
  
    fetchEventData();
  }, [id]); // The ID is a dependency, so the effect will run whenever it changes


  const handleChange = (e) => {
    let value = e.target.value; // Get the value from the input element
    setEvent({ ...event, [e.target.name]: value }); // Update the event state 
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Avoid page refresh
  
    // Validate and prepare data before submission
    const validatedEvent = validateAndPrepareData(event);
    if (!validatedEvent) {
      return;
    }
  
    try {
      let response; // Will hold the response from the server

      if (id) { // If there is an ID, update the existing event
        response = await axios.put(`http://localhost:5000/api/event/${id}`, validatedEvent);
      } else { // Otherwise, create the new event
        response = await axios.post('http://localhost:5000/api/event/compose', validatedEvent);
      }
      if (response.status === 200) {
        navigate('/');  // Navigate to the home page after the event is created or updated
      }

    } catch (error) {
      console.error(error);
    }
  };

  const validateAndPrepareData = (event) => {
    let validatedEvent = { ...event }; //copy
  
    // Fuse date and time into a single Date object
    // Again, glitchy! Will be fixed with the time machine.
    const start = validatedEvent.allDay ? 
    new Date(validatedEvent.startDate.split('-')[0], validatedEvent.startDate.split('-')[1] - 1, validatedEvent.startDate.split('-')[2], 0, 0) :
    new Date(Date.UTC(validatedEvent.startDate.split('-')[0], validatedEvent.startDate.split('-')[1] - 1, validatedEvent.startDate.split('-')[2], validatedEvent.startTime.split(':')[0], validatedEvent.startTime.split(':')[1]));
    const end = validatedEvent.allDay ? 
    new Date(validatedEvent.endDate.split('-')[0], validatedEvent.endDate.split('-')[1] - 1, validatedEvent.endDate.split('-')[2], 23, 59) :
    new Date(Date.UTC(validatedEvent.endDate.split('-')[0], validatedEvent.endDate.split('-')[1] - 1, validatedEvent.endDate.split('-')[2], validatedEvent.endTime.split(':')[0], validatedEvent.endTime.split(':')[1]));
  
    // Check if end is after start
    if (end <= start) {
      alert('The end of the event must be after its start!');
      return null;
    }
  
    // Value preparation for stopRecurrence, stopDate, and stopNumber.
    // Not strictly necessary, but it ensures the data is consistent.
    switch (validatedEvent.stopRecurrence) {
      case 'never':
        validatedEvent.stopDate = '';
        validatedEvent.stopNumber = '';
        break;
      case 'date':
        validatedEvent.stopNumber = '';
        validatedEvent.stopDate = new Date(`${validatedEvent.stopDate}T23:59`);
        break;
      case 'number':
        validatedEvent.stopDate = '';
        break;
    }
  
    return { ...validatedEvent, start, end };
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

      <div className="mb-3 form-check">
        <input type="checkbox" name="allDay" checked={event.allDay} onChange={handleChange} className="form-check-input" id="allDay" />
        <label className="form-check-label" htmlFor="allDay">All Day</label>
      </div>

      <div className="mb-3">
        <label htmlFor="startDate" className="form-label">Start Date</label>
        <input type="date" name="startDate" value={event.startDate} onChange={handleChange} className="form-control" id="startDate" required/>
      </div>
      {!event.allDay && (
        <div className="mb-3">
          <label htmlFor="startTime" className="form-label">Start Time</label>
          <input type="time" name="startTime" value={event.startTime} onChange={handleChange} className="form-control" id="startTime" />
        </div>
      )}
      <div className="mb-3">
        <label htmlFor="endDate" className="form-label">End Date</label>
        <input type="date" name="endDate" value={event.endDate} onChange={handleChange} className="form-control" id="endDate" required/>
      </div>
      {!event.allDay && (
        <div className="mb-3">
          <label htmlFor="endTime" className="form-label">End Time</label>
          <input type="time" name="endTime" value={event.endTime} onChange={handleChange} className="form-control" id="endTime" />
        </div>
      )}

      <div className="mb-3">
        <label htmlFor="frequency" className="form-label">Frequency</label>
        <select name="frequency" value={event.frequency} onChange={handleChange} className="form-select" id="frequency">
          <option value="none">None</option>
          <option value="daily">Daily</option>
          <option value="daily_ferial">Daily Ferial</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="monthly_weekday">Monthly Weekday</option>
          <option value="yearly">Yearly</option>
          <option value="custom">Custom</option>
        </select>
      </div>
      {event.frequency !== 'none' && (  // Show the select only if frequency is not 'none'
        <div className="mb-3">
          <label htmlFor="stopRecurrence" className="form-label">Stop Recurrence</label>
          <select name="stopRecurrence" value={event.stopRecurrence} onChange={handleChange} className="form-select" id="stopRecurrence">
            <option value="never">Never</option>
            <option value="date">Date</option>
            <option value="number">Number</option>
          </select>
        </div>
      )}
      {event.stopRecurrence === 'date' && (
        <div className="mb-3">
          <label htmlFor="stopDate" className="form-label">Stop Date</label>
          <input type="date" name="stopDate" value={event.stopDate} onChange={handleChange} required className="form-control" id="stopDate" />
        </div>
      )}
      {event.stopRecurrence === 'number' && (
        <div className="mb-3">
          <label htmlFor="stopNumber" className="form-label">Stop Number</label>
          <input type="number" name="stopNumber" value={event.stopNumber} onChange={handleChange} required className="form-control" id="stopNumber" />
        </div>
      )}

      <button type="submit" className="btn btn-primary">Submit</button>
    </form>
    <Footer />
    </>
  );
};

export default Compose;