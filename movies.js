const express = require('express');
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

// Add a new movie
router.post('/add', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    try {
        const { title, director, release_date } = req.body;
        const movie = new Movie({ title, director, release_date });
        await movie.save();
        res.status(201).json({ message: 'Movie added' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a movie
router.put('/update/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    try {
        const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(movie);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// List all movies
router.get('/list', authenticateToken, async (req, res) => {
    try {
        const movies = await Movie.find();
        res.json(movies);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Search movies
router.get('/search', authenticateToken, async (req, res) => {
    try {
        const { query } = req.query;
        const movies = await Movie.find({ title: new RegExp(query, 'i') });
        res.json(movies);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;