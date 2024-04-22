import React, { useState } from 'react';
import axios from 'axios';

import Footer from './partials/footer';
import Header from './partials/header';

const ComposeEvent = () => {
  const [event, setEvent] = useState({
    title: '',
    description: '',
    location: '',
    allDay: false,

    startDate: new Date().toISOString().split('T')[0], // get current date in YYYY-MM-DD format
    startTime: '00:00',   // in the future, change to current time               
    endDate: new Date().toISOString().split('T')[0],
    endTime: '00:00',     // in the future, change to current time + 1 hour

    frequency: 'none',
    stopRecurrence: 'never',
    stopDate: null,
    stopNumber: null,
    completed: false,
  });

  const handleChange = (e) => {
    let value = e.target.type === 'checkbox' ? e.target.checked : e.target.value; // Handle checkbox 'off' inputs
    setEvent({ ...event, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submit action
    
    // Convert date and time strings to Date objects
    const start = event.allDay ? new Date(`${event.startDate}T00:00`) : new Date(`${event.startDate}T${event.startTime}`);
    const end = event.allDay ? new Date(`${event.endDate}T23:59`) : new Date(`${event.endDate}T${event.endTime}`);
  
    // Check if end is after start
    if (end <= start) {
      alert('The end of the event must be after its start!');
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:5000/compose', { ...event, start, end });
      if (response.status === 200) {
        window.location = '/';  // Redirect to the home page if the operation was successful
      }
    } catch (error) {
      console.error(error);
    }
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

export default ComposeEvent;