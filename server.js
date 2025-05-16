const express = require('express');
const path = require('path');
const { createTask, readTasks, updateTask, deleteTask, closeConnection } = require('./db.js');
const cors = require('cors');

const app = express();
const port = 3000;
app.use(express.json());
app.use(express.static('public'));
app.use(cors());
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));


// create
app.post('/tasks', async(req,res) => {
    try {
        const task = req.body;
        const result = await createTask(task);
        if (result) {
            res.status(201).json({ _id : result.insertedId, ...task });
        } else {
            res.status(500).send('Failed to create task.');
        }
    } catch(err) {
        res.status(500).send('Server error.');
    }
});


// read
app.get('/tasks', async (req, res) => {
    try {
        const tasks = await readTasks();
        res.json(tasks);
    } catch(err) {
        res.status(500).send('Failed to fetch tasks.');
    }
});


// update
app.put('/tasks/:id', async(req,res) => {
    const id = req.params.id;
    const task = req.body;

    try {
        await updateTask(task, id);
        res.status(200).json({ ...task, _id: id});
    } catch(err) {
        res.status(500).send("Server error.");
    }
});


app.delete('/tasks', async (req, res) => {
    try {
        let taskID = req.body.key;
        const success = await deleteTask(taskID);

        if (success) {
            res.status(200).send("Task deleted successfully.");
        } else {
            res.status(404).send('Task not found.');
        }
    } catch (err) {
        res.status(500).send("Server error.");
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
})