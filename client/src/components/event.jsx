import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const Event = ({ event, onEventDelete }) => {
  axios.defaults.withCredentials = true;
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);  // State to track if the card is hovered

  const handleEditClick = () => {
    navigate(`/compose/${event._id}`);  // Navigate to the compose page with the event id
  };

  const handleDeleteClick = () => {
    axios.delete(`http://localhost:5000/api/event/${event._id}`)
      .then(() => {
        onEventDelete(event._id); // update the parent's UI
      })
      .catch(error => console.error('Error deleting event:', error));
  };

  const handleCardBodyClick = () => {
    if (event) {
      const details = [];
      if (event.description) {
        details.push(`Description:\n\n${event.description}`); // Description Top
      }
      if (event.location) {
        details.push(`Location:\n\n${event.location}`); // Location Bottom
      }
      const fullDetails = details.join('\n\n====================\n\n'); // Separate them with a line
      alert(fullDetails);
    }
  };

  const truncateText = (text) => {  // Utility function to truncate text and add '...'
    return text.length > 50 ? `${text.substring(0, 50)}...` : text;
  };

  return (
    <div className="col">
      <div className="card h-100">

      <div className={`card-body ${isHovered ? "bg-light" : ""}`} 
        onMouseEnter={() => setIsHovered(true)} 
        onMouseLeave={() => setIsHovered(false)} 
        onClick={(event.description || event.location) ? handleCardBodyClick : undefined}>
        <h5 className="card-title">{event.title}</h5>

        {event.description ? (
          <p>{truncateText(event.description)}</p>
        ) : (
          <p>No description available.</p>
        )}

        {event.location ? (
          <p>
            <strong>Location:</strong>{" "}
            {truncateText(event.location)}
          </p>
        ) : (
          <p>No location present.</p>
        )}

        {/* Hide seconds */}
        <p><strong>Start:</strong> {event.allDay ? new Date(event.start).toLocaleDateString() : new Date(event.start).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}</p>
        <p><strong>End:</strong> {event.allDay ? new Date(event.end).toLocaleDateString() : new Date(event.end).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}</p>

        <div className="d-flex">  {/* Conditional rendering */}
          {event.frequency !== 'none' && <p><strong>Frequency:</strong> {event.frequency}</p>}
          {event.stopDate && <p>, until: {new Date(event.stopDate).toLocaleDateString()}</p>}
          {event.stopNumber && <p>, for another: {event.stopNumber} times</p>}
        </div>

      </div>

      <div className="card-footer d-flex justify-content-between align-items-center">
          <button type="button" className="btn btn-primary" onClick={handleEditClick}>
            Edit
          </button>
          <button type="button" className="btn btn-danger" onClick={handleDeleteClick}>
            Del
          </button>
      </div>

      </div>
    </div>
  );
};

export default Event;