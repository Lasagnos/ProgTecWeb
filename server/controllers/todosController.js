const Todo = require('../models/Todo');

// Get all todos, GET
exports.getTodos = (req, res) => {
  Todo.find()
    .then(todos => res.json(todos))
    .catch(err => res.status(500).json({ error: err.message }));
};

// Get a single todo, GET
exports.getTodo = (req, res) => {
    Todo.findById(req.params.id)
        .then(todo => {
        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        res.json(todo);
        })
        .catch(err => res.status(500).json({ error: err.message }));
}

// Create a new todo, POST
exports.createTodo = async (req, res) => {
  const { todo, dueDate, user } = req.body;

  try {
      const newTodo = new Todo({
          todo,
          dueDate,
          user: user || req.user._id, // Use the user ID from the request, or fall back to the logged-in user
      });

      const savedTodo = await newTodo.save();

      res.json(savedTodo);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
};

// Update a todo, PUT
exports.updateTodo = (req, res) => {
  Todo.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(todo => {
      if (!todo) {
        return res.status(404).json({ message: 'Todo not found' });
      }
      res.json(todo);
    })
    .catch(err => res.status(500).json({ error: err.message }));
}

// Delete a todo, DELETE
exports.deleteTodo = (req, res) => {
  Todo.findByIdAndDelete(req.params.id)
    .then(todo => {
      if (!todo) {
        return res.status(404).json({ message: 'Todo not found' });
      }
      res.json(todo);
    })
    .catch(err => res.status(500).json({ error: err.message }));
};

// Complete a todo, PUT
exports.completeTodo = (req, res) => {
  Todo.findByIdAndUpdate(req.params.id, { completed: true }, { new: true })
    .then(todo => {
      if (!todo) {
        return res.status(404).json({ message: 'Todo not found' });
      }
      res.json(todo);
    })
    .catch(err => res.status(500).json({ error: err.message }));
};