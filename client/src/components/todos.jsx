import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from './utilities/config';
import { useCookies } from 'react-cookie';
import { useTimeMachine } from './contexts/timeMachineContext';

import Footer from './partials/footer';
import Header from './partials/header';

function Todos() {
  axios.defaults.withCredentials = true;
  const [todos, setTodos] = useState([]);
  const [todo, setTodo] = useState(''); 
  const [dueDate, setDueDate] = useState('');
  const [cookies] = useCookies(['user']);
  const { timeMachineDate } = useTimeMachine();

  useEffect(() => { // Fetch the todos when the component is mounted
    axios.get(`${config.apiBaseUrl}/todos`)
      .then(response => setTodos(response.data))
      .catch(error => console.error('Error fetching todos:', error));
  }, []);

  // Create a new todo
  const handleSubmit = (event) => { 
    event.preventDefault(); // Avoid page refresh

    axios.post(`${config.apiBaseUrl}/todos`, { todo, dueDate })  // Send the todo and due date to the server
      .then(response => {
        setTodos(currentTodos => [...currentTodos, response.data]);  // Add the new todo to the state
        setTodo('');  // Clear the todo input
        setDueDate(''); // Clear the due date input
      })
      .catch(error => console.error('Error creating todo:', error.response));
  };

  // Delete the selected todo
  const handleClear = (id) => {
    axios.delete(`${config.apiBaseUrl}/todos/${id}`)
      .then(() => {
        // Remove the todo from the state, filtering out the todo with the specified ID
        setTodos(currentTodos => currentTodos.filter(todo => todo._id !== id));
      })
      .catch(error => console.error('Error deleting todo:', error));
  };

  // Deletes all todos (of the current user)
  const handleClearAll = () => {
    const userId = cookies.user.id; // Get the user's ID from the cookies. Should be always available
  
    axios.delete(`${config.apiBaseUrl}/todos/user/${userId}`)
      .then(() => {
        setTodos([]); // Clear the todos in the state
      })
      .catch(error => console.error('Error deleting all todos:', error));
  };

  // Toggles completion of todos
  const handleCheckboxChange = (event, id) => {
    const completed = event.target.checked; // Get the 'checked' status

    axios.put(`${config.apiBaseUrl}/todos/${id}`, { completed })
      .then(response => {
        // Update the todo in the state, replacing said todo with the updated one
        setTodos(currentTodos => currentTodos.map(todo => todo._id === id ? response.data : todo));
      })
      .catch(error => console.error('Error updating todo:', error));
  };

  // Gives todos their color based on their due date (overdue, today, pending soon, default, completed)
  const getTodoColor = (todo) => {
    if (todo.completed) { // Completed todos are green
      return 'bg-success';
    }
  
    const dueDate = new Date(todo.dueDate);
    dueDate.setHours(0, 0, 0, 0); // Set the time to the start of the dueDate
    const now = new Date(timeMachineDate);
    now.setHours(0, 0, 0, 0); // Get the current time
  
    const threeDaysFromNow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4);
  
    if (dueDate < now) {  // Overdue todos are black
      return 'bg-dark';
    } else if (dueDate.getTime() === now.getTime()) {  // Todos expiring today are red
      return 'bg-danger';
    } else if (dueDate < threeDaysFromNow) {  // Todos pending soon (3 days from now) are yellow
      return 'bg-warning';
    }
  
    return '';  // Default 'color'
  };


  return (
    <>
    <Header />
    <div className="container">

      <h2 className='text-center text-md-start'>Add Todo</h2>

      <form onSubmit={handleSubmit} className="mb-5">
        <div className="row align-items-center text-center text-md-start">
          <div className="col-md-5 mb-3">
            <label htmlFor="todo" className="form-label">Todo:</label>
            <input id="todo" type="text" className="form-control" value={todo} onChange={e => setTodo(e.target.value)} required />
          </div>
          <div className="col-md-5 mb-3">
            <label htmlFor="dueDate" className="form-label">Due Date:</label>
            <input id="dueDate" type="date" className="form-control" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
          </div>
          <div className="col-md-2 d-flex align-items-center justify-content-center justify-content-md-end">
            <button type="submit" className="btn btn-primary">
              <i className="fa fa-plus" aria-hidden="true"></i> Create Todo
            </button>
          </div>
        </div>
      </form>

      <h2 className='text-center text-md-start'>Current Todos <button type="button" className="btn btn-danger ms-2" onClick={handleClearAll}>Clear All</button></h2>
      
      {todos.sort((a, b) => {   // Sorts the todos
        // Sort by completion first
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;  // Completed todos go last (1) while pending todos go first (-1)
        }
        // Sort by due date second
        return new Date(a.dueDate) - new Date(b.dueDate);

      }).map(todo => {
        const todoColor = getTodoColor(todo);  // Get the color for the todo
        return (
          // Add the color to the specific todo, and add text-white for readability to dark backgrounds
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
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ')
                      {e.preventDefault();
                        handleClear(todo._id);}
                    }}  style={{ cursor: 'pointer' }} aria-label="Clear todo"
                  ></span>  {/* Clear button */}
                </div>

              </div>
            </div>
          </div>
        );
      })}

    </div>
    <Footer />
    </>
  );
}

export default Todos;