import React from 'react';
import axios from 'axios';

const Event = ({ event, onEventUpdate, onEventDelete }) => {
  const handleCompletedChange = async (e) => {
    const updatedEvent = { ...event, completed: !event.completed };
    const response = await axios.put(`http://localhost:5000/events/${event._id}`, updatedEvent);
    if (response.status === 200) {
      onEventUpdate(updatedEvent);
    }
  };

  const handleDeleteClick = async () => {
    const response = await axios.delete(`http://localhost:5000/events/${event._id}`);
    if (response.status === 204) {  // 204: No Content
      onEventDelete(event._id);
    }
  };

  return (
    <div className="col">
      <div className="card h-100">
        <div className="card-body">
          <h5 className="card-title">{event.title}</h5>
          {event.description ? (
            <p>{event.description.substring(0, 100)}....</p>
          ) : (
            <p>No description available.</p>
          )}
          <p>Location: {event.location}</p>
          <p>Start: {new Date(event.start).toLocaleString()}</p>
          <p>End: {new Date(event.end).toLocaleString()}</p>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              checked={event.completed}
              onChange={handleCompletedChange}
            />
            <label className="form-check-label" htmlFor="completedCheck">
              Completed
            </label>
          </div>
        </div>
        <div className="card-footer">
          <small className="text-body-secondary">
            Frequency: {event.frequency}
          </small>
          <button type="button" className="btn btn-danger" onClick={handleDeleteClick}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default Event;