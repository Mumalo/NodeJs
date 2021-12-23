"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
let todos = [];
router.get('/', (req, res, next) => {
    res
        .status(200)
        .json({ todos: todos });
});
router.post('/todo', (req, res, next) => {
    const newTodo = {
        id: new Date().toISOString(),
        text: req.body.text
    };
    todos.push(newTodo);
    res.status(201).json({ message: 'added new todo', todos: todos });
});
router.put('/todo/:todoId', (req, res, next) => {
    const tId = req.params.todoId;
    const todoIndex = todos.findIndex(todo => todo.id == tId);
    if (todoIndex >= 0) {
        todos[todoIndex] = { id: todos[todoIndex].id, text: req.body.text };
        return res.status(201).json({ message: 'updated todo', todos: todos });
    }
    res.status(404).json({ message: 'Could not find todo for this id' });
});
router.delete('/todo/:todoId', (req, res, next) => {
    const tId = req.params.todoId;
    todos = todos.filter(todo => todo.id !== req.params.todoId);
    res.status(200).json({ message: 'deleted todos', todos: todos });
});
exports.default = router;
