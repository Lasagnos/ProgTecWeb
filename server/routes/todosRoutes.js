const express = require('express');
const router = express.Router();
const todosController = require('../controllers/todosController');

// Get all todos
router.get('/', todosController.getTodos);

// Get a single todo by ID
router.get('/:id', todosController.getTodo);

// Create a new todo
router.post('/', todosController.createTodo);

// Update an existing todo
router.put('/:id', todosController.updateTodo);

// Delete a todo
router.delete('/:id', todosController.deleteTodo);

// Complete a todo
router.put('/:id/complete', todosController.completeTodo);

module.exports = router;