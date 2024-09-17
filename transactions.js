const express = require('express');
const Transaction = require('../models/transaction');
const Book = require('../models/book');
const Movie = require('../models/movie');
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

// Issue item
router.post('/issue', authenticateToken, async (req, res) => {
    try {
        const { bookId, movieId } = req.body;
        const book = bookId ? await Book.findById(bookId) : null;
        const movie = movieId ? await Movie.findById(movieId) : null;
        if (book && !book.available) return res.status(400).json({ message: 'Book not available' });
        if (movie && !movie.available) return res.status(400).json({ message: 'Movie not available' });

        const transaction = new Transaction({
            user: req.user.userId,
            book: bookId || null,
            movie: movieId || null,
            status: 'issued'
        });

        if (book) book.available = false;
        if (movie) movie.available = false;

        await transaction.save();
        if (book) await book.save();
        if (movie) await movie.save();

        res.status(201).json({ message: 'Item issued', transaction });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Return item
router.post('/return/:id', authenticateToken, async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

        const book = transaction.book ? await Book.findById(transaction.book) : null;
        const movie = transaction.movie ? await Movie.findById(transaction.movie) : null;

        if (book) book.available = true;
        if (movie) movie.available = true;

        transaction.return_date = new Date();
        transaction.status = 'returned';

        await transaction.save();
        if (book) await book.save();
        if (movie) await movie.save();

        res.json({ message: 'Item returned', transaction });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Active issues
router.get('/active-issues', authenticateToken, async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user.userId, status: 'issued' });
        res.json(transactions);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Overdue returns
router.get('/overdue', authenticateToken, async (req, res) => {
    try {
        const transactions = await Transaction.find({ return_date: { $exists: false }, status: 'issued' });
        res.json(transactions);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;