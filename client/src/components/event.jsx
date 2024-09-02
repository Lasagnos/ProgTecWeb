import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
//import { formatCustomFrequency } from './utilities/utilityFunctions';

const Event = ({ event, onEventDelete }) => {
  axios.defaults.withCredentials = true;
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);  // State to track if the card is hovered

  // const remainingOccurrences = event.stopNumber ? event.stopNumber - event.occurrenceCycleCount - 1 : null;
  // const isLastOccurrence = remainingOccurrences === 0;
  
  const handleEditClick = () => {
    navigate(`/event/write/${event._id}`);  // Navigate to the eventWrite page with the event id
  };

  const handleDeleteClick = () => {
    axios.delete(`http://localhost:5000/api/event/${event._id}`)
      .then(() => {
        onEventDelete(event._id); // update the parent's UI
      })
      .catch(error => console.error('Error deleting event:', error));
  };

  // // Opens the event. Same as handleEditClick, maybe change in the future
  // const handleCardBodyClick = () => {
  //   navigate(`/event/write/${event._id}`);
  // };

  const truncateText = (text, max) => {  // Utility function to truncate text and add '...'
    return text.length > max ? `${text.substring(0, max)}...` : text;
  };

  return (
    <div className="col">
      <div className="card h-100">

        <div className={`card-body ${isHovered ? "bg-light" : ""}`} 
          onMouseEnter={() => setIsHovered(true)} 
          onMouseLeave={() => setIsHovered(false)} 
          // onClick={handleCardBodyClick}
        >
        <h5 className="card-title mb-2">{truncateText(event.title, 50)}</h5>

        {event.description ? (
          <p className="mb-2">{truncateText(event.description, 50)}</p>
        ) : (
          <p className="mb-2">No description available.</p>
        )}

        {event.location ? (
          <p className="mb-2">{truncateText(event.location, 50)}</p>
        ) : (
          <p className="mb-2">No location present.</p>
        )}

        <p className="mb-2"><strong>Start:</strong> {event.allDay ? new Date(event.start).toLocaleDateString() : 
          new Date(event.start).toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}  {/* Date format, no seconds */}
        </p>
        <p className="mb-2"><strong>End:</strong> {event.allDay ? new Date(event.end).toLocaleDateString() : 
          new Date(event.end).toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
        </p>

        
        {/* Frequency conditional rendering. Call formatCustomFrequency if it's custom */}
        {/* 
        {event.frequency !== 'none' && (
          <p><strong>Frequency: </strong> 
          {event.frequency === 'custom' ? truncateText(formatCustomFrequency(event.customFrequency), 50) :
            event.frequency}</p>
        )}
        */}
        {/* stopDate/stopNumber conditional rendering */}
        {/* 
        {event.stopDate && <p>Repeat until: {new Date(event.stopDate).toLocaleDateString()}</p>}
        {remainingOccurrences !== null && (
          <p>{isLastOccurrence ? 'Last occurrence' : `Repeat for another: ${remainingOccurrences} ${remainingOccurrences === 1 ? 'time' : 'times'}`}</p>
        )}
        */}
      

        {/* Indicate if the event is a recurring event */}
        <p className='text-muted mb-2'>{event.frequency === 'none' ? 'Single event' : 'Recurring event'}</p>

      </div>

      <div className="card-footer d-flex justify-content-between align-items-center">
        <button type="button" className="btn btn-primary" onClick={handleEditClick}>
          Open
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