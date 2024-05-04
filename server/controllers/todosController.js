const Todo = require('../models/Todo');

// Get all todos, GET
exports.getTodos = (req, res) => {
  Todo.find({ user: req.user._id }) // Get all todos of the authenticated user
    .then(todos => res.json(todos)) // Send the todos in the response
    .catch(err => res.status(500).json({ error: err.message }));
};

// Get a single todo, GET
exports.getTodo = (req, res) => {
    Todo.findById(req.params.id)  // Get a single todo by its ID
        .then(todo => {
            if (!todo) {
                return res.status(404).json({ message: 'Todo not found' });
            }
            res.json(todo); // Send the todo in the response
        })
        .catch(err => res.status(500).json({ error: err.message }));
}


// Create a new todo, POST
exports.createTodo = async (req, res) => {
  try {
      const newTodo = new Todo({
          todo: req.body.todo,
          dueDate: req.body.dueDate,
          user: req.user._id, // Set the user ID of the authenticated user
      });
      const savedTodo = await newTodo.save(); 

      res.json(savedTodo);  // Send the saved todo in the response
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
};


// Update a todo, PUT. Not used in the app
exports.updateTodo = (req, res) => {
  Todo.findByIdAndUpdate(req.params.id, req.body, { new: true })  // Find the todo by ID and update it. Return the new, modified todo
    .then(todo => {
      if (!todo) {
        return res.status(404).json({ message: 'Todo not found' });
      }
      res.json(todo); // Send the new, modified todo in the response
    })
    .catch(err => res.status(500).json({ error: err.message }));
}

// Complete a todo, PUT
exports.completeTodo = (req, res) => {
  Todo.findByIdAndUpdate(req.params.id, { completed: true }, { new: true }) // Find the todo by ID and mark it as completed. Return the new, modified todo
    .then(todo => {
      if (!todo) {
        return res.status(404).json({ message: 'Todo not found' });
      }
      res.json(todo); // Send the new, modified todo in the response
    })
    .catch(err => res.status(500).json({ error: err.message }));
};


// Delete a todo, DELETE
exports.deleteTodo = (req, res) => {
  Todo.findByIdAndDelete(req.params.id) // Find the todo by ID and delete it
    .then(todo => {
      if (!todo) {
        return res.status(404).json({ message: 'Todo not found' });
      }
      res.json(todo);
    })
    .catch(err => res.status(500).json({ error: err.message }));
};

// Delete all todos of a user, DELETE
exports.deleteUserTodos = (req, res) => {
  Todo.deleteMany({ user: req.params.userId })  // Delete all todos of a user by the user ID
    .then(() => {
      res.json({ message: 'All todos deleted' });
    })
    .catch(err => res.status(500).json({ error: err.message }));
};