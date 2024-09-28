//javascript Smart Task Manager API
// new directory for your project and initialize it with npm:
mkdir task-manager-api
cd task-manager-api
npm init -y

//Install Dependencies
newFunction(install ,npm)

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/taskmanager', { useNewUrlParser: true, useUnifiedTopology: true });

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Task', TaskSchema);

const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// Create a new task
router.post('/tasks', async (req, res) => {
  const task = new Task(req.body);
  try {
    await task.save();
    res.status(201).send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all tasks
router.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find({});
    res.send(tasks);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get a task by ID
router.get('/tasks/:id', async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findById(_id);
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update a task by ID
router.patch('/tasks/:id', async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['title', 'description', 'completed'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).send();
    }

    updates.forEach((update) => task[update] = req.body[update]);
    await task.save();
    res.send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete a task by ID
router.delete('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;

const taskRouter = require('./routes/tasks');

app.use(taskRouter);

const axios = require('axios');

// Function to call AI model
const categorizeTask = async (task) => {
  const response = await axios.post('http://ai-model-api/categorize', { title: task.title, description: task.description });
  return response.data.category;
};

// Modify the task creation route to include AI categorization
router.post('/tasks', async (req, res) => {
  const task = new Task(req.body);
  try {
    task.category = await categorizeTask(task);
    await task.save();
    res.status(201).send(task);
  } catch (error) {
    res.status(400).send(error);
  }
  
  npm install node-cron

  const cron = require('node-cron');
const Task = require('./models/Task');

// Schedule a cron job to run every hour
cron.schedule('0 * * * *', async () => {
  const now = new Date();
  const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  try {
    const tasksDueSoon = await Task.find({ dueDate: { $lte: next24Hours, $gte: now } });
    tasksDueSoon.forEach(task => {
      console.log(`Reminder: Task "${task.title}" is due soon!`);
      // Here you can integrate with an external service to send actual notifications
    });
  } catch (error) {
    console.error('Error fetching tasks due soon:', error);
  }
  const TaskSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    dueDate: {
      type: Date,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    recurrence: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'monthly'],
      default: 'none'
    }
  });

  // Schedule a cron job to run daily at midnight
cron.schedule('0 0 * * *', async () => {
  const now = new Date();

  try {
    const recurringTasks = await Task.find({ recurrence: { $ne: 'none' } });
    recurringTasks.forEach(async task => {
      let nextDueDate;
      switch (task.recurrence) {
        case 'daily':
          nextDueDate = new Date(task.dueDate.getTime() + 24 * 60 * 60 * 1000);
          break;
        case 'weekly':
          nextDueDate = new Date(task.dueDate.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          nextDueDate = new Date(task.dueDate.setMonth(task.dueDate.getMonth() + 1));
          break;
      }

      const newTask = new Task({
        title: task.title,
        description: task.description,
        dueDate: nextDueDate,
        recurrence: task.recurrence
      });

      await newTask.save();
      console.log(`Created recurring task: "${newTask.title}" due on ${newTask.dueDate}`);
    });
  } catch (error) {
    console.error('Error creating recurring tasks:', error);
  }
  mongoose.connect('mongodb://localhost:27017/taskmanager', { useNewUrlParser: true, useUnifiedTopology: true });

  document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('new-task-form');
    const taskList = document.getElementById('task-list');
  
    taskForm.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const title = document.getElementById('title').value;
      const description = document.getElementById('description').value;
      const dueDate = document.getElementById('dueDate').value;
      const recurrence = document.getElementById('recurrence').value;
  
      const task = { title, description, dueDate, recurrence };
  
      // Simulate API call
      const response = await fetch('http://localhost:3000/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(task)
      });
  
      const newTask = await response.json();
      addTaskToList(newTask);
      taskForm.reset();
    });
  
    const addTaskToList = (task) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span>${task.title} - ${task.dueDate}</span>
        <button onclick="deleteTask('${task._id}')">Delete</button>
      `;
      taskList.appendChild(li);
    };
  
    window.deleteTask = async (id) => {
      await fetch(`http://localhost:3000/tasks/${id}`, {
        method: 'DELETE'
      });
      document.querySelector(`li[data-id="${id}"]`).remove();
    };
  
    // Fetch and display tasks on load
    const fetchTasks = async () => {
      const response = await fetch('http://localhost:3000/tasks');
      const tasks = await response.json();
      tasks.forEach(addTaskToList);
    };
  
    fetchTasks();
  });
  document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');
    const modal = document.getElementById('task-modal');
    const openModalButton = document.getElementById('open-modal');
    const closeModalButton = document.querySelector('.close-button');
    const modalTitle = document.getElementById('modal-title');
    let editingTaskId = null;
  
    openModalButton.addEventListener('click', () => {
      modalTitle.textContent = 'Create a New Task';
      taskForm.reset();
      editingTaskId = null;
      modal.style.display = 'block';
    });
  
    closeModalButton.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  
    window.onclick = (event) => {
      if (event.target == modal) {
        modal.style.display = 'none';
      }
    };
  
    taskForm.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const title = document.getElementById('title').value;
      const description = document.getElementById('description').value;
      const dueDate = document.getElementById('dueDate').value;
      const recurrence = document.getElementById('recurrence').value;
  
      const task = { title, description, dueDate, recurrence };
  
      let response;
      if (editingTaskId) {
        response = await fetch(`http://localhost:3000/tasks/${editingTaskId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(task)
        });
      } else {
        response = await fetch('http://localhost:3000/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(task)
        });
      }
  
      const newTask = await response.json();
      if (editingTaskId) {
        updateTaskInList(newTask);
      } else {
        addTaskToList(newTask);
      }
      taskForm.reset();
      modal.style.display = 'none';
    });
  
    const addTaskToList = (task) => {
      const div = document.createElement('div');
      div.className = 'task-card';
      div.dataset.id = task._id;
      div.innerHTML = `
        <h3>${task.title}</h3>
        <p>${task.description}</p>
        <p>Due: ${task.dueDate}</p>
        <p class="status">${task.completed ? 'Completed' : 'Pending'}</p>
        <button onclick="editTask('${task._id}')">Edit</button>
        <button onclick="confirmDeleteTask('${task._id}')">Delete</button>
      `;
      taskList.appendChild(div);
    };
  
    const updateTaskInList = (task) => {
      const taskCard = document.querySelector(`.task-card[data-id="${task._id}"]`);
      taskCard.querySelector('h3').textContent = task.title;
      taskCard.querySelector('p:nth-child(2)').textContent = task.description;
      taskCard.querySelector('p:nth-child(3)').textContent = `Due: ${task.dueDate}`;
      taskCard.querySelector('.status').textContent = task.completed ? 'Completed' : 'Pending';
    };
  
    window.editTask = (id) => {
      const taskCard = document.querySelector(`.task-card[data-id="${id}"]`);
      const title = taskCard.querySelector('h3').textContent;
      const description = taskCard.querySelector('p:nth-child(2)').textContent;
      const dueDate = taskCard.querySelector('p:nth-child(3)').textContent.split(': ')[1];
      const recurrence = taskCard.querySelector('p:nth-child(4)').textContent;
  
      document.getElementById('title').value = title;
      document.getElementById('description').value = description;
      document.getElementById('dueDate').value = dueDate;
      document.getElementById('recurrence').value = recurrence;
  
      modalTitle.textContent = 'Edit Task';
      editingTaskId = id;
      modal.style.display = 'block';
    };
  
    window.confirmDeleteTask = (id) => {
      const confirmationDialog = document.createElement('div');
      confirmationDialog.className = 'confirmation-dialog';
      confirmationDialog.innerHTML = `
        <div class="dialog-content">
          <p>Are you sure you want to delete this task?</p>
          <button onclick="deleteTask('${id}')">Yes</button>
          <button onclick="closeConfirmationDialog()">No</button>
        </div>
      `;
      document.body.appendChild(confirmationDialog);
      confirmationDialog.style.display = 'block';
    };
  
    window.closeConfirmationDialog = () => {
      const confirmationDialog = document.querySelector('.confirmation-dialog');
      confirmationDialog.remove();
    };
  
    window.deleteTask = async (id) => {
      await fetch(`http://localhost:3000/tasks/${id}`, {
        method: 'DELETE'
      });
      document.querySelector(`.task-card[data-id="${id}"]`).remove();
      closeConfirmationDialog();
    };
  
    // Fetch and display tasks on load
    const fetchTasks = async () => {
      const response = await fetch('http://localhost:3000/tasks');
      const tasks = await response.json();
      tasks.forEach(addTaskToList);
    };
  
    fetchTasks();
  });
  document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');
    const modal = document.getElementById('task-modal');
    const openModalButton = document.getElementById('open-modal');
    const closeModalButton = document.querySelector('.close-button');
    const modalTitle = document.getElementById('modal-title');
    let editingTaskId = null;
  
    openModalButton.addEventListener('click', () => {
      modalTitle.textContent = 'Create a New Task';
      taskForm.reset();
      editingTaskId = null;
      modal.style.display = 'block';
    });
  
    closeModalButton.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  
    window.onclick = (event) => {
      if (event.target == modal) {
        modal.style.display = 'none';
      }
    };
  
    taskForm.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const title = document.getElementById('title').value;
      const description = document.getElementById('description').value;
      const dueDate = document.getElementById('dueDate').value;
      const recurrence = document.getElementById('recurrence').value;
  
      const task = { title, description, dueDate, recurrence };
  
      let response;
      if (editingTaskId) {
        response = await fetch(`http://localhost:3000/tasks/${editingTaskId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(task)
        });
      } else {
        response = await fetch('http://localhost:3000/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(task)
        });
      }
  
      const newTask = await response.json();
      if (editingTaskId) {
        updateTaskInList(newTask);
      } else {
        addTaskToList(newTask);
      }
      taskForm.reset();
      modal.style.display = 'none';
    });
  
    const addTaskToList = (task) => {
      const div = document.createElement('div');
      div.className = 'task-card';
      div.dataset.id = task._id;
      div.innerHTML = `
        <h3>${task.title}</h3>
        <p>${task.description}</p>
        <p>Due: ${task.dueDate}</p>
        <p class="status">${task.completed ? 'Completed' : 'Pending'}</p>
        <button onclick="editTask('${task._id}')">Edit</button>
        <button onclick="confirmDeleteTask('${task._id}')">Delete</button>
      `;
      taskList.appendChild(div);
    };
  
    const updateTaskInList = (task) => {
      const taskCard = document.querySelector(`.task-card[data-id="${task._id}"]`);
      taskCard.querySelector('h3').textContent = task.title;
      taskCard.querySelector('p:nth-child(2)').textContent = task.description;
      taskCard.querySelector('p:nth-child(3)').textContent = `Due: ${task.dueDate}`;
      taskCard.querySelector('.status').textContent = task.completed ? 'Completed' : 'Pending';
    };
  
    window.editTask = (id) => {
      const taskCard = document.querySelector(`.task-card[data-id="${id}"]`);
      const title = taskCard.querySelector('h3').textContent;
      const description = taskCard.querySelector('p:nth-child(2)').textContent;
      const dueDate = taskCard.querySelector('p:nth-child(3)').textContent.split(': ')[1];
      const recurrence = taskCard.querySelector('p:nth-child(4)').textContent;
  
      document.getElementById('title').value = title;
      document.getElementById('description').value = description;
      document.getElementById('dueDate').value = dueDate;
      document.getElementById('recurrence').value = recurrence;
  
      modalTitle.textContent = 'Edit Task';
      editingTaskId = id;
      modal.style.display = 'block';
    };
  
    window.confirmDeleteTask = (id) => {
      const confirmationDialog = document.createElement('div');
      confirmationDialog.className = 'confirmation-dialog';
      confirmationDialog.innerHTML = `
        <div class="dialog-content">
          <p>Are you sure you want to delete this task?</p>
          <button onclick="deleteTask('${id}')">Yes</button>
          <button onclick="closeConfirmationDialog()">No</button>
        </div>
      `;
      document.body.appendChild(confirmationDialog);
      confirmationDialog.style.display = 'block';
    };
  
    window.closeConfirmationDialog = () => {
      const confirmationDialog = document.querySelector('.confirmation-dialog');
      confirmationDialog.remove();
    };
  
    window.deleteTask = async (id) => {
      await fetch(`http://localhost:3000/tasks/${id}`, {
        method: 'DELETE'
      });
      document.querySelector(`.task-card[data-id="${id}"]`).remove();
      closeConfirmationDialog();
    };
  
    // Fetch and display tasks on load
    const fetchTasks = async () => {
      const response = await fetch('http://localhost:3000/tasks');
      const tasks = await response.json();
      tasks.forEach(addTaskToList);
    };
  
    fetchTasks();
  });
  document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');
    const modal = document.getElementById('task-modal');
    const openModalButton = document.getElementById('open-modal');
    const closeModalButton = document.querySelector('.close-button');
    const modalTitle = document.getElementById('modal-title');
    let editingTaskId = null;
  
    openModalButton.addEventListener('click', () => {
      modalTitle.textContent = 'Create a New Task';
      taskForm.reset();
      editingTaskId = null;
      modal.style.display = 'block';
    });
  
    closeModalButton.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  
    window.onclick = (event) => {
      if (event.target == modal) {
        modal.style.display = 'none';
      }
    };
  
    taskForm.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const title = document.getElementById('title').value;
      const description = document.getElementById('description').value;
      const dueDate = document.getElementById('dueDate').value;
      const recurrence = document.getElementById('recurrence').value;
  
      const task = { title, description, dueDate, recurrence };
  
      let response;
      if (editingTaskId) {
        response = await fetch(`http://localhost:3000/tasks/${editingTaskId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(task)
        });
      } else {
        response = await fetch('http://localhost:3000/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(task)
        });
      }
  
      const newTask = await response.json();
      if (editingTaskId) {
        updateTaskInList(newTask);
      } else {
        addTaskToList(newTask);
      }
      taskForm.reset();
      modal.style.display = 'none';
    });
  
    const addTaskToList = (task) => {
      const div = document.createElement('div');
      div.className = 'task-card';
      div.dataset.id = task._id;
      div.innerHTML = `
        <h3>${task.title}</h3>
        <p>${task.description}</p>
        <p>Due: ${task.dueDate}</p>
        <p class="status">${task.completed ? 'Completed' : 'Pending'}</p>
        <button onclick="editTask('${task._id}')">Edit</button>
        <button onclick="confirmDeleteTask('${task._id}')">Delete</button>
      `;
      taskList.appendChild(div);
    };
  
    const updateTaskInList = (task) => {
      const taskCard = document.querySelector(`.task-card[data-id="${task._id}"]`);
      taskCard.querySelector('h3').textContent = task.title;
      taskCard.querySelector('p:nth-child(2)').textContent = task.description;
      taskCard.querySelector('p:nth-child(3)').textContent = `Due: ${task.dueDate}`;
      taskCard.querySelector('.status').textContent = task.completed ? 'Completed' : 'Pending';
    };
  
    window.editTask = (id) => {
      const taskCard = document.querySelector(`.task-card[data-id="${id}"]`);
      const title = taskCard.querySelector('h3').textContent;
      const description = taskCard.querySelector('p:nth-child(2)').textContent;
      const dueDate = taskCard.querySelector('p:nth-child(3)').textContent.split(': ')[1];
      const recurrence = taskCard.querySelector('p:nth-child(4)').textContent;
  
      document.getElementById('title').value = title;
      document.getElementById('description').value = description;
      document.getElementById('dueDate').value = dueDate;
      document.getElementById('recurrence').value = recurrence;
  
      modalTitle.textContent = 'Edit Task';
      editingTaskId = id;
      modal.style.display = 'block';
    };
  
    window.confirmDeleteTask = (id) => {
      const confirmationDialog = document.createElement('div');
      confirmationDialog.className = 'confirmation-dialog';
      confirmationDialog.innerHTML = `
        <div class="dialog-content">
          <p>Are you sure you want to delete this task?</p>
          <button onclick="deleteTask('${id}')">Yes</button>
          <button onclick="closeConfirmationDialog()">No</button>
        </div>
      `;
      document.body.appendChild(confirmationDialog);
      confirmationDialog.style.display = 'block';
    };
  
    window.closeConfirmationDialog = () => {
      const confirmationDialog = document.querySelector('.confirmation-dialog');
      confirmationDialog.remove();
    };
  
    window.deleteTask = async (id) => {
      await fetch(`http://localhost:3000/tasks/${id}`, {
        method: 'DELETE'
      });
      document.querySelector(`.task-card[data-id="${id}"]`).remove();
      closeConfirmationDialog();
    };
  
    // Fetch and display tasks on load
    const fetchTasks = async () => {
      const response = await fetch('http://localhost:3000/tasks');
      const tasks = await response.json();
      tasks.forEach(addTaskToList);
    };
  
    fetchTasks();
  });
    
});  
});
});
function newFunction() {
    npm; install; express; mongoose; body - parser
}

