import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Event = ({ event, onEventUpdate, onEventDelete }) => {
  const navigate = useNavigate(); //'hook' to navigate to compose and edit event

  const handleCompletedChange = async (e) => {
    const updatedEvent = { ...event, completed: !event.completed };
    const response = await axios.put(`http://localhost:5000/event/${event._id}`, updatedEvent);
    if (response.status === 200) {
      onEventUpdate(updatedEvent);
    }
  };

  const handleEditClick = () => {
    navigate(`/compose/${event._id}`);
  };

  const handleDeleteClick = async () => {
    const response = await axios.delete(`http://localhost:5000/event/${event._id}`);
    if (response.status === 204) {  // 204: No Content
      onEventDelete(event._id);
    }
  };

  const handleCardBodyClick = () => {
    if (event) {
      alert(event.description);
    }
  };

  return (
    <div className="col">
      <div className="card h-100">

      <div className="card-body" onClick={event.description ? handleCardBodyClick : undefined}>
        <h5 className="card-title">{event.title}</h5>

        {event.description ? (
          <p>{event.description.substring(0, 50)}...</p>
        ) : (
          <p>No description available.</p>
        )}
        {event.location ? (
          <p><strong>Location:</strong> {event.location.substring(0, 50)}</p>
        ) : (
          <p>No location present.</p>
        )}

        <p><strong>Start:</strong> {event.allDay ? new Date(event.start).toLocaleDateString() : new Date(event.start).toLocaleString()}</p>
        <p><strong>End:</strong> {event.allDay ? new Date(event.end).toLocaleDateString() : new Date(event.end).toLocaleString()}</p>

        {/*Visualize only if present*/}
        <div className="d-flex">
          {event.frequency !== 'none' && <p><strong>Frequency:</strong> {event.frequency}</p>}
          {event.stopDate && <p>, until: {new Date(event.stopDate).toLocaleDateString()}</p>}
          {event.stopNumber && <p>, for another: {event.stopNumber} times</p>}
        </div>

      </div>

      <div className="card-footer d-flex justify-content-between align-items-center">
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            checked={event.completed}
            onChange={handleCompletedChange}
          />
          <label className="form-check-label" htmlFor="completedCheck">
            Completed!
          </label>
        </div>
        <div>
          <button type="button" className="btn btn-primary" onClick={handleEditClick}>
            Edit
          </button>
          <button type="button" className="btn btn-danger" onClick={handleDeleteClick}>
            Del
          </button>
        </div>
      </div>

      </div>
    </div>
  );
};

export default Event;