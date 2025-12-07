const mongoose = require('mongoose');

const MealSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    image: { type: String }, // Base64 or URL
    foods: [{
        label: String,
        calories: Number,
        protein: Number,
        carbs: Number,
        fat: Number,
        weight: Number, // grams
        confidence: Number
    }],
    totalCalories: Number,
    synced: { type: Boolean, default: true }
});

module.exports = mongoose.model('Meal', MealSchema);
