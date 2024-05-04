import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Footer from './partials/footer';
import Header from './partials/header';
import Event from './event';

const Home = ({ content }) => {
  axios.defaults.withCredentials = true;
  const [events, setEvents] = useState([]);

  useEffect(() => { // Fetch the events from the server
    axios.get('http://localhost:5000/api/event')
      .then(response => {
        const data = response.data;
        Array.isArray(data) ? setEvents(data) : setEvents([]);  // set events if an array is received
      })
      .catch(error => console.error('Error:', error));
  }, []);

  const handleEventUpdate = (updatedEvent) => {
    // Update the event in the state by replacing the event by its id
    setEvents(events.map(event => event._id === updatedEvent._id ? updatedEvent : event));
  };

  const handleEventDelete = (deletedEventId) => {
    // Delete the event from the state by filtering out the event through its id
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