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
    start: '',
    end: '',
    frequency: 'none', // default value
    stopRecurrence: 'never', // default value
    completed: false,
  });

  const handleChange = (e) => {
    setEvent({ ...event, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/compose', event);
      window.location = '/';
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
        <input type="text" name="title" value={event.title} onChange={handleChange} required className="form-control" id="title" />
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
        <label htmlFor="start" className="form-label">Start</label>
        <input type="datetime-local" name="start" value={event.start} onChange={handleChange} required className="form-control" id="start" />
      </div>
      <div className="mb-3">
        <label htmlFor="end" className="form-label">End</label>
        <input type="datetime-local" name="end" value={event.end} onChange={handleChange} required className="form-control" id="end" />
      </div>

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
      

      <div className="mb-3 form-check">
        <input type="checkbox" name="completed" checked={event.completed} onChange={handleChange} className="form-check-input" id="completed" />
        <label className="form-check-label" htmlFor="completed">Completed</label>
      </div>
      <button type="submit" className="btn btn-primary">Submit</button>
    </form>
    <Footer />
    </>
  );
};

export default ComposeEvent;