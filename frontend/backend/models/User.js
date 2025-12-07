const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profile: {
        dob: { type: Date },
        gender: { type: String, enum: ['male', 'female'] },
        height: { type: Number }, // cm
        weight: { type: Number }  // kg
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
