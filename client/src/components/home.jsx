import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import config from './utilities/config';
import { useNavigate } from 'react-router-dom';
import Footer from './partials/footer';
import Header from './partials/header';
import { useTimeMachine } from './contexts/timeMachineContext';
import { toLocalISOString, expandRecurringEvents, truncateContent, truncateCategories, formatDate, formatTime } from './utilities/utilityFunctions';
import Event from './partials/event';
import ReactMarkdown from 'react-markdown';

const Home = () => {
  axios.defaults.withCredentials = true;
  const navigate = useNavigate();
  const { timeMachineDate } = useTimeMachine();

  // Supplementary functions for the links
  const handleMouseEnter = (e) => {
    e.target.classList.add('text-secondary');
    e.target.classList.remove('text-dark');
  };
  const handleMouseLeave = (e) => {
    e.target.classList.add('text-dark');
    e.target.classList.remove('text-secondary');
  };
  const handleClick = (path) => {
    navigate(path);
  };

  // String of the time machine's date part. Used to fetch events based on the date and not the time
  const [timeMachineDateString, setTimeMachineDateString] = useState(toLocalISOString(timeMachineDate).split('T')[0]);
  useEffect(() => {
    setTimeMachineDateString(toLocalISOString(timeMachineDate).split('T')[0]);
  }, [timeMachineDate]);


  // References for page skips
  const calendarRef = useRef(null);
  const todosRef = useRef(null);
  const notesRef = useRef(null);
  const pomodoroRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current.scrollIntoView({ behavior: 'smooth' });
  };


  /* CALENDAR SECTION */

  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);

  // Fetch events on component mount and when the time machine date changes
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${config.apiBaseUrl}/event`);
        const events = response.data;

        const expandedEvents = expandRecurringEvents(events, timeMachineDateString);
        setEvents(expandedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, [timeMachineDateString]);

  // Filter events based on the time machine date
  useEffect(() => {

    const filtered = events.filter(event => {
      const eventStartDate = toLocalISOString(new Date(event.start)).split('T')[0];
      const eventEndDate = toLocalISOString(new Date(event.end)).split('T')[0];
      return timeMachineDateString >= eventStartDate && timeMachineDateString <= eventEndDate;
    });

    setFilteredEvents(filtered);
  }, [timeMachineDateString, events]);


  /* TODOS SECTION */

  const [todos, setTodos] = useState([]);

  // Fetch todos on component mount. Automatically filters them
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await axios.get(`${config.apiBaseUrl}/todos`);
        const todos = response.data;
    
        const now = new Date(timeMachineDateString);
        now.setHours(0, 0, 0, 0); // Set the time to the start of the current date
        const threeDaysFromNow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3);
    
        const filtered = todos.filter(todo => {
          const dueDate = new Date(todo.dueDate);
          dueDate.setHours(0, 0, 0, 0); // Set the time to the start of the due date
          return !todo.completed && (dueDate < now || (dueDate >= now && dueDate <= threeDaysFromNow));
        });

        // Sort by expiration date
        const sorted = filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
        setTodos(sorted);
      } catch (error) {
        console.error('Error fetching todos:', error);
      }
    };

    fetchTodos();
  }, [timeMachineDateString]);

  const getTodoColor = (todo) => {
    if (todo.completed) { // Completed todos are green
      return 'bg-success';
    }

    const dueDate = new Date(todo.dueDate);
    dueDate.setHours(0, 0, 0, 0); // Set the time to the start of the dueDate
    const now = new Date(timeMachineDateString);
    now.setHours(0, 0, 0, 0); // Get the current time

    const threeDaysFromNow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4);

    if (dueDate < now) {  // Overdue todos are black
      return 'bg-dark';
    } else if (dueDate.getTime() === now.getTime()) {  // Todos expiring today are red
      return 'bg-danger';
    } else if (dueDate < threeDaysFromNow) {  // Todos pending soon (3 days from now) are yellow
      return 'bg-warning';
    }

    return '';  // Default color
  };

  const handleClear = (id) => {
    axios.delete(`${config.apiBaseUrl}/todos/${id}`)
      .then(() => {
        // Remove the todo from the state, filtering out the todo with the specified ID
        setTodos(currentTodos => currentTodos.filter(todo => todo._id !== id));
      })
      .catch(error => console.error('Error deleting todo:', error));
  };

  const handleCheckboxChange = (event, id) => {
    const completed = event.target.checked; // Get the 'checked' status

    axios.put(`${config.apiBaseUrl}/todos/${id}`, { completed })
      .then(response => {
        // Update the todo in the state (replace it with the updated one)
        // setTodos(currentTodos => currentTodos.map(todo => todo._id === id ? response.data : todo));
        // Since we're in the home, we remove it from being seen
        setTodos(currentTodos => currentTodos.filter(todo => todo._id !== id));
      })
      .catch(error => console.error('Error updating todo:', error));
  };


  /* NOTES SECTION */

  const [notes, setNotes] = useState([]);

  // Fetch notes on component mount
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await axios.get(`${config.apiBaseUrl}/notes`);
        setNotes(response.data);
      } catch (error) {
        console.error('Error fetching notes:', error);
      }
    };

    fetchNotes();
  }, []);

  // Get the last updated note
  const lastUpdatedNote = notes.length > 0 ? notes.reduce((latest, note) => { 
    return new Date(note.updatedAt) > new Date(latest.updatedAt) ? note : latest; // Sort by updatedAt
  }) : null;

  // only this button on home component
  const handleModify = (id) => {
    navigate(`/notes/write/${id}`);
  };


  /* POMODORO SECTION */

  const [lastSession, setLastSession] = useState(null);

  useEffect(() => {
    const fetchLastSession = async () => {
      try {
        const response = await axios.get(`${config.apiBaseUrl}/pomodoro/last-session`);
        setLastSession(response.data);
      } catch (error) {
        console.error('Error fetching last Pomodoro session:', error);
      }
    };

    fetchLastSession();
  }, []);
  


  return (
    <>
      <Header />
      <div className="container">
        {/* Link for page skips */}
        <h5 className="text-center my-3">Jump to:</h5>
        <div className="d-flex justify-content-around my-3 btn-group">
          <a href="#calendar" onClick={() => scrollToSection(calendarRef)} className="btn btn-outline-primary">Calendar</a>
          <a href="#todos" onClick={() => scrollToSection(todosRef)} className="btn btn-outline-primary">Todos</a>
          <a href="#notes" onClick={() => scrollToSection(notesRef)} className="btn btn-outline-primary">Notes</a>
          <a href="#pomodoro" onClick={() => scrollToSection(pomodoroRef)} className="btn btn-outline-primary">Pomodoro</a>
        </div>
        <div className="row">


          {/* Calendar Section */}
          <div className="col-12 my-3" ref={calendarRef}>
            <h3 className='text-center my-3'>
              <span
                onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
                onClick={() => handleClick('/calendar')}
                style={{ cursor: 'pointer' }}
              >
                Calendar
              </span>
              <small className="text-secondary ms-2">- Today's events</small>
            </h3>

            {filteredEvents.length > 0 ? (
              <div className="row row-cols-1 row-cols-md-3 g-4">
                {filteredEvents.map(event => (
                  <Event key={event._id} event={event} />
                ))}
              </div>
            ) : (
              <p className='text-center'>No events today.</p>
            )}

          </div>

          

          {/* Todos Section */}
          <div className="col-12 my-3" ref={todosRef}>
            <h3 className='text-center my-3'>
              <span
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleClick('/todos')}
                style={{ cursor: 'pointer' }}
              >
                Todos
              </span>
              <small className="text-secondary ms-2">- Pending todos</small>
            </h3>

            <div>
            {todos.length > 0 ? (
              todos.map(todo => {
                const todoColor = getTodoColor(todo);
                return (
                  <div key={todo._id} className={`card mb-3 ${todoColor} ${todoColor === 'bg-dark' || todoColor === 'bg-success' || todoColor === 'bg-danger' ? 'text-white' : ''}`}>
                    <div className="card-body">
                      <div className="row">

                        <div className="col-lg-9 col-md-8 col-sm-7">
                          <strong className="card-title">
                            {todo.todo.length > 100 ? `${todo.todo.substring(0, 97)}...` : todo.todo}
                          </strong>
                        </div>

                        <div className="col-lg-3 col-md-4 col-sm-5 d-flex justify-content-end align-items-center">
                          <div className="d-flex align-items-center mx-2">{new Date(todo.dueDate).toLocaleDateString()}</div>  {/* Due date */}
                          <input type="checkbox" data-bs-toggle="tooltip" title="Mark as completed" checked={todo.completed} onChange={e => handleCheckboxChange(e, todo._id)} />  {/* Completed checkbox */}

                          <span role="button" tabIndex="0" className={`fas fa-times ${todoColor === 'bg-danger' ? 'text-dark' : 'text-danger'} ms-3`}
                            onClick={() => handleClear(todo._id)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClear(todo._id); } }}
                            style={{ cursor: 'pointer' }} aria-label="Clear todo"
                          ></span>  {/* Clear button */}
                        </div>

                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className='text-center'>No pending todos.</p>
            )}
            </div>

          </div>



          {/* Notes Section */}
          <div className="col-12 my-3" ref={notesRef}>
            <h3 className='text-center my-3'>
              <span
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleClick('/notes')}
                style={{ cursor: 'pointer' }}
              >
                Notes
              </span>
              <small className="text-secondary ms-2">- Last updated note</small>
            </h3>

            {lastUpdatedNote ? (
              <div className="card mb-3">
                <div className="card-body">
                  <h4 className="card-title">{lastUpdatedNote.title}</h4>
                  <hr className="my-3" style={{ borderColor: 'gray' }} />
                  <div className="card-text">
                    <ReactMarkdown>{truncateContent(lastUpdatedNote.content, 250)}</ReactMarkdown>
                  </div>
                  <hr className="my-3" style={{ borderColor: 'gray' }} />
                  <small className="text-muted">Categories: {truncateCategories(lastUpdatedNote.categories, 150)}</small>
                  <hr className="my-3" style={{ borderColor: 'gray' }} />

                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
                    <div className="btn-group mb-2 mb-md-0">
                      <button className="btn btn-primary mr-2" onClick={() => handleModify(lastUpdatedNote._id)}>Open</button>
                      {/* <button className="btn btn-secondary mr-2" onClick={() => handleDuplicate(lastUpdatedNote)}>Duplicate</button>
                      <button className="btn btn-danger" onClick={() => handleDelete(lastUpdatedNote._id)}>Delete</button> */}
                    </div>
                    <small className="text-muted text-center text-md-right">
                      Created on: {formatDate(lastUpdatedNote.createdAt)}, Last updated: {formatDate(lastUpdatedNote.updatedAt)}
                    </small>
                  </div>
                </div>
              </div>
            ) : (
              <p className='text-center'>No notes present.</p>
            )}

          </div>



          {/* Pomodoro Section */}
          <div className="col-12 my-3" ref={pomodoroRef}>
            <h3 className='text-center my-3'>
              <span
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleClick('/pomodoro')}
                style={{ cursor: 'pointer' }}
              >
                Pomodoro
              </span>
              <small className="text-secondary ms-2">- Last session's info</small>
            </h3>

            {lastSession ? (
              lastSession.sessionDuration === 0 ? ( // Session ongoing
                <div className="text-center">
                  <p>A pomodoro session is currently ongoing.</p>
                  <button className="btn btn-primary" onClick={() => navigate('/pomodoro')}>Click to resume</button>
                </div>
              ) : (
                <div className="card text-center mx-auto w-100 w-md-75">
                  <div className="card-header">
                    <h3>Session Details</h3>
                  </div>
                  <div className="card-body">
                    <p>Set Working Time & Pause Time: {lastSession.setPomodoroDuration}m & {lastSession.setRestDuration}m</p>
                    <p>Time spent in session: {formatTime(lastSession.sessionDuration)}</p>
                    <p>Time spent working: {formatTime(lastSession.workDuration)}, equal to {lastSession.workPercentage}% of the session</p>
                    <p>Cycle reached: {lastSession.maxRepetition} out of {lastSession.setRepetitions}</p>
                    <p>Session Completed: {lastSession.completed ? 'Yes :)' : 'No :('}</p>
                    {/* <button className="btn btn-primary mt-3" onClick={() => setLastSession(null)}>Back to the form</button> */}
                  </div>
                </div>
              )
            ) : (
              <p className='text-center'>No pomodoro session was concluded yet.</p>
            )}

          </div>


        </div>
      </div>
      <Footer />
    </>
  );
};

export default Home;