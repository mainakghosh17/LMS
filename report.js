const express = require('express');
const Transaction = require('../models/transaction');
const Book = require('../models/book');
const Movie = require('../models/movie');

const router = express.Router();

// Report of book issues
router.get('/book-issues', async (req, res) => {
    try {
        const transactions = await Transaction.aggregate([
            { $match: { book: { $ne: null } } },
            { $group: { _id: '$book', count: { $sum: 1 } } },
            { $lookup: { from: 'books', localField: '_id', foreignField: '_id', as: 'book' } },
            { $unwind: '$book' }
        ]);
        res.json(transactions);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Report of movie issues
router.get('/movie-issues', async (req, res) => {
    try {
        const transactions = await Transaction.aggregate([
            { $match: { movie: { $ne: null } } },
            { $group: { _id: '$movie', count: { $sum: 1 } } },
            { $lookup: { from: 'movies', localField: '_id', foreignField: '_id', as: 'movie' } },
            { $unwind: '$movie' }
        ]);
        res.json(transactions);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;