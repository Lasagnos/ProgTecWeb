import React, { useEffect, useState } from 'react';
import axios from 'axios';

import Footer from './partials/footer';
import Header from './partials/header';

function Todos() {
  const [todos, setTodos] = useState([]);
  const [todo, setTodo] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => { // Fetch the todos when the component is mounted
    axios.get('http://localhost:5000/api/todos') // api?
      .then(response => setTodos(response.data))
      .catch(error => console.error('Error fetching todos:', error));
  }, []);

  const handleSubmit = (event) => { // Create a new todo
    event.preventDefault();

    axios.post('http://localhost:5000/api/todos', { todo, dueDate }) // api?
      .then(response => {
        setTodos([...todos, response.data]);
        setTodo('');
        setDueDate('');
      })
      .catch(error => console.error('Error creating todo:', error));
  };

  const handleDelete = (id) => {
    axios.delete(`http://localhost:5000/api/todos/${id}`)
      .then(() => {
        setTodos(todos.filter(todo => todo._id !== id));
      })
      .catch(error => console.error('Error deleting todo:', error));
  };

  const handleCheckboxChange = (event, id) => {
    const completed = event.target.checked;

    axios.put(`http://localhost:5000/api/todos/${id}`, { completed })
      .then(response => {
        setTodos(todos.map(todo => todo._id === id ? response.data : todo));
      })
      .catch(error => console.error('Error updating todo:', error));
  };

  const getTodoColor = (todo) => {
    if (todo.completed) { // Completed todos are green
      return 'bg-success';
    }
  
    const dueDate = new Date(todo.dueDate);
    dueDate.setHours(0, 0, 0, 0); // Set the time to the start of the day
    const now = new Date();
    now.setHours(0, 0, 0, 0);
  
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1); // Get the date of the next day
    const threeDaysFromNow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3); // Get the date of three days from now
  
    if (dueDate < tomorrow) {  // Overdue todos are black
      return 'bg-dark';
    } else if (dueDate < threeDaysFromNow) {  // Todos pending soon (3 days) are yellow
      return 'bg-warning';
    }
  
    return '';
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

      <h2>Current Todos</h2>

      {todos.sort((a, b) => {
        // Sort by completion
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        // Sort by due date
        return new Date(a.dueDate) - new Date(b.dueDate);

      }).map(todo => {
        const todoColor = getTodoColor(todo);  // Get the color class
        return (
          <div key={todo._id} className={`card mb-3 ${todoColor} ${todoColor === 'bg-dark' || todoColor === 'bg-success' ? 'text-white' : ''}`}>  {/* Add the color class */}
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <strong className="card-title" style={{ marginRight: '10px' }}>{todo.todo}</strong>
                  <div className="d-flex align-items-center">{new Date(todo.dueDate).toLocaleDateString()}</div>
                </div>
                <div className="d-flex align-items-center">
                  <input type="checkbox" checked={todo.completed} onChange={e => handleCheckboxChange(e, todo._id)} />
                  <span className="ms-2">Completed</span>
                  <button type="button" className="btn btn-danger ms-2" onClick={() => handleDelete(todo._id)}>Delete</button>
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