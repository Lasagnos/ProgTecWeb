import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';

import Footer from './partials/footer';
import Header from './partials/header';

function Todos() {
  axios.defaults.withCredentials = true;
  const [todos, setTodos] = useState([]);
  const [todo, setTodo] = useState(''); 
  const [dueDate, setDueDate] = useState('');
  const [cookies] = useCookies(['user']);

  useEffect(() => { // Fetch the todos when the component is mounted
    axios.get('http://localhost:5000/api/todos')
      .then(response => setTodos(response.data))
      .catch(error => console.error('Error fetching todos:', error));
  }, []);


  const handleSubmit = (event) => { // Create a new todo
    event.preventDefault(); // Avoid page refresh

    axios.post('http://localhost:5000/api/todos', { todo, dueDate })  // Send the todo and due date to the server
      .then(response => {
        setTodos(currentTodos => [...currentTodos, response.data]);  // Add the new todo to the state
        setTodo('');  // Clear the todo input
        setDueDate(''); // Clear the due date input
      })
      .catch(error => console.error('Error creating todo:', error.response));
  };


  const handleClear = (id) => {
    axios.delete(`http://localhost:5000/api/todos/${id}`)
      .then(() => {
        // Remove the todo from the state, filtering out the todo with the specified ID
        setTodos(currentTodos => currentTodos.filter(todo => todo._id !== id));
      })
      .catch(error => console.error('Error deleting todo:', error));
  };

  const handleClearAll = () => {
    const userId = cookies.user.id; // Get the user's ID from the cookies. Should be always available
  
    axios.delete(`http://localhost:5000/api/todos/user/${userId}`)
      .then(() => {
        setTodos([]); // Clear the todos in the state
      })
      .catch(error => console.error('Error deleting all todos:', error));
  };


  const handleCheckboxChange = (event, id) => {
    const completed = event.target.checked; // Get the 'checked' status

    axios.put(`http://localhost:5000/api/todos/${id}`, { completed })
      .then(response => {
        // Update the todo in the state, replacing said todo with the updated one
        setTodos(currentTodos => currentTodos.map(todo => todo._id === id ? response.data : todo));
      })
      .catch(error => console.error('Error updating todo:', error));
  };

  const getTodoColor = (todo) => {
    if (todo.completed) { // Completed todos are green
      return 'bg-success';
    }
  
    const dueDate = new Date(todo.dueDate);
    dueDate.setHours(0, 0, 0, 0); // Set the time to the start of the dueDate
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Get the current time (maybe get it fron creationDate?)
  
    const threeDaysFromNow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3); // Get the date of three days from now
  
    if (dueDate < now) {  // Overdue todos are black
      return 'bg-dark';
    } else if (dueDate < threeDaysFromNow) {  // Todos pending soon (span 3 days) are yellow
      return 'bg-warning';
    }
  
    return '';  // Default color
  };


  return (
    <>
    <Header />
    <div className="container">

    <h2>Add Todo</h2>

    <form onSubmit={handleSubmit} className="mb-3">
      <div className="row align-items-center">
        <div className="col-md-5 mb-3">
          <label htmlFor="todo" className="form-label">Todo:</label>
          <input id="todo" type="text" className="form-control" value={todo} onChange={e => setTodo(e.target.value)} required />
        </div>
        <div className="col-md-5 mb-3">
          <label htmlFor="dueDate" className="form-label">Due Date:</label>
          <input id="dueDate" type="date" className="form-control" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
        </div>
        <div className="col-md-2 d-flex align-items-center justify-content-end">
          <button type="submit" className="btn btn-primary">Create Todo</button>
        </div>
      </div>
    </form>

      <h2>Current Todos <button type="button" className="btn btn-danger ms-2" onClick={handleClearAll}>Clear All</button></h2>

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
          // Add the color to the specific todo, and add text-white if overdue or completed
          <div key={todo._id} className={`card mb-3 ${todoColor} ${todoColor === 'bg-dark' || todoColor === 'bg-success' ? 'text-white' : ''}`}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">

                <div className="d-flex align-items-center">
                  <strong className="card-title" style={{ marginRight: '10px' }}>{todo.todo}</strong> {/* Title */}

                  <div className="d-flex align-items-center">{new Date(todo.dueDate).toLocaleDateString()}</div>  {/* Due date */}
                </div>

                <div className="d-flex align-items-center">
                  <input type="checkbox" checked={todo.completed} onChange={e => handleCheckboxChange(e, todo._id)} />  {/* Completed checkbox */}
                  <span className="ms-2">Completed</span>

                  <button type="button" className="btn btn-danger ms-2" onClick={() => handleClear(todo._id)}>Clear</button>  {/* Clear button */}
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