
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^[A-Za-z0-9._%+-]+@ucla\.edu$/, "Please use a UCLA email."]
    },

    name: {
        type: String,
        required: true
    },

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);