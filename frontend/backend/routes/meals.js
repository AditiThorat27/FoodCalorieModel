const express = require('express');
const router = express.Router();
const Meal = require('../models/Meal');
const { analyzeImage } = require('../services/gemini');
const jwt = require('jsonwebtoken');

// Middleware to verify token
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (e) {
        res.status(400).json({ msg: 'Token is not valid' });
    }
};

// Analyze Image
router.post('/analyze', auth, async (req, res) => {
    try {
        const { imageBase64 } = req.body;
        if (!imageBase64) return res.status(400).json({ msg: 'No image provided' });

        const analysis = await analyzeImage(imageBase64);
        res.json(analysis);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Save Meal
router.post('/', auth, async (req, res) => {
    try {
        const { date, image, foods, totalCalories } = req.body;

        const newMeal = new Meal({
            userId: req.user.userId,
            date,
            image,
            foods,
            totalCalories
        });

        const meal = await newMeal.save();
        res.json(meal);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Get Meals
router.get('/', auth, async (req, res) => {
    try {
        const meals = await Meal.find({ userId: req.user.userId }).sort({ date: -1 });
        res.json(meals);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
