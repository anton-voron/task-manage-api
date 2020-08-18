const express = require('express');
const Task = require('../models/task');
const router = new express.Router();
const authMiddleware = require('../middleware/auth');

//Task
router.post('/tasks', authMiddleware, async (req, res) => {
    const { user } = req;
    // const task = new Task(req.body);
    const task = new Task({
        ...req.body,
        owner: user._id
    })
    // task.save()
    //     .then(() => {
    //         res.status(201).send(task);
    //     })
    //     .catch(error => {
    //         res.status(400).send(error);
    //     })

    try {
        await task.save();
        res.status(201).send(task);
    } catch (error) {
        res.status(400).send(error);
    }
})
// Get /task?completed=true/false
// Get /task?limit=10&skip=10
// Get /tasks?sortBy=createdAt:asc/desc
router.get('/tasks', authMiddleware, async (req, res) => {
    const { user } = req
    const match = {}
    const sort = {};
    const { completed, limit, skip, sortBy } = req.query;
    if (completed) {
        match.completed = completed === 'true';
    }
    if (sortBy) {
        const parts = sortBy.split(':');
        // asc = 1, desc = -1
        sort[parts[0]] = parts[1] === 'asc' ? 1 : -1;
    }
    // Task.find({})
    //     .then(result => res.send(result))
    //     .catch(error => res.status(500).send(error));
    try {
        // const tasks = await Task.find({ owner: user._id });
        await user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(limit),
                skip: parseInt(skip),
                sort
            }
        }).execPopulate();
        res.send(user.tasks);
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/tasks/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    // Task.findById(id)
    //     .then(result => {
    //         if (!result) {
    //             return res.status(400).send();
    //         }
    //         res.send(result);
    //     })
    //     .catch(error => res.status(500).send(error));

    try {
        // const task = await Task.findById(id);
        const task = await Task.findOne({ _id: id, owner: req.user._id })
        if (!task) {
            return res.status(404).send({
                error: 'Task does not exist'
            });
        }

        res.send(task);
    } catch (error) {
        res.status(500).send(error)
    }
})

router.patch('/tasks/:id', authMiddleware, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    const { id } = req.params;
    const { user } = req;
    try {
        // const task = await Task.findById(id);
        // const task = await Task.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        const task = await Task.findOne({ _id: id, owner: user._id })
        if (!task) {
            return res.status(400).send({ error: 'Task was not fount' });
        }
        updates.forEach(update => task[update] = req.body[update]);
        await task.save();
        res.send(task);
    } catch (error) {
        res.status(500).send(error);
    }
})



router.delete('/tasks/:id', authMiddleware, async (req, res) => {
    const { user } = req;
    const { id } = req.params;
    try {
        const task = await Task.findOneAndDelete({ _id: id, owner: user._id });
        if (!task) {
            return res.status(404).send({ error: `Task with id: ${id} was not found` })
        }
        res.send(task);
    } catch (error) {
        res.status(500).send(error)
    }
});

module.exports = router;