import React, { useEffect, useState } from 'react';
import Footer from './partials/footer';
import Header from './partials/header';

const Home = ({ content }) => {
  
  //get the events from the server
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch('/events')
      .then(response => response.json())
      .then(data => setEvents(data))
      .catch(error => console.error('Error:', error));
  }, []);



  return (
    <>
      <Header />
      <h1>Home</h1>
      <p>{content}</p>
      <div className="row row-cols-1 row-cols-md-3 g-4">
        {events.map((event) => (
          <div className="col" key={event.title}>
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
              </div>
              <div className="card-footer">
                <small className="text-body-secondary">
                  Frequency: {event.frequency}
                </small>
                <small className="text-body-secondary">
                  Completed: {event.completed ? "Yes" : "No"}
                </small>
              </div>
              <button type="button" className="btn btn-outline-info">
                <a href={`/events/${event.title}`}> Read more</a>
              </button>
            </div>
          </div>
        ))}
      </div>
      <Footer />
    </>
  );
};

export default Home;