const express = require('express');
const Book = require('../models/book');
const jwt = require('jsonwebtoken');

const router = express.Router();

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);
    jwt.verify(token, 'your_jwt_secret', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Add a new book
router.post('/add', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    try {
        const { title, author, published_date } = req.body;
        const book = new Book({ title, author, published_date });
        await book.save();
        res.status(201).json({ message: 'Book added' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a book
router.put('/update/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    try {
        const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(book);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// List all books
router.get('/list', authenticateToken, async (req, res) => {
    try {
        const books = await Book.find();
        res.json(books);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Search books
router.get('/search', authenticateToken, async (req, res) => {
    try {
        const { query } = req.query;
        const books = await Book.find({ title: new RegExp(query, 'i') });
        res.json(books);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;