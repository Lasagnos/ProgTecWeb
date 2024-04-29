import React, { useEffect, useState } from 'react';
import Footer from './partials/footer';
import Header from './partials/header';
import Event from './event';

const Home = ({ content }) => {
  const [events, setEvents] = useState([]);

  useEffect(() => { // Fetch all events in the beginning
    fetch('http://localhost:5000/api/event')
      .then(response => response.json())
      .then(data => setEvents(data))
      .catch(error => console.error('Error:', error));
  }, []);

  const handleEventUpdate = (updatedEvent) => {
    setEvents(events.map(event => event._id === updatedEvent._id ? updatedEvent : event));
  };

  const handleEventDelete = (deletedEventId) => {
    setEvents(events.filter(event => event._id !== deletedEventId));
  };

  return (
    <>
      <Header />
      <h1>Home</h1>
      <p>{content}</p>
      <div className="row row-cols-1 row-cols-md-3 g-4">
        {events.map((event) => (
          <Event
            key={event._id}
            event={event}
            onEventUpdate={handleEventUpdate}
            onEventDelete={handleEventDelete}
          /> // Pass the callback functions as props
        ))}
      </div>
      <Footer />
    </>
  );
};

export default Home;