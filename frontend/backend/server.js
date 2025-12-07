const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const mealRoutes = require('./routes/meals');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for image uploads

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/auth', authRoutes);
app.use('/meals', mealRoutes);

app.get('/', (req, res) => {
    res.send('Food Calorie App API is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
