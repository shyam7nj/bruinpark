
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    
    // How the DB identifies users internally:
    googleId: {
        type: String,
        required: true,
        unique: true
    },
    
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^[A-Za-z0-9._%+-]+@(g\.)?ucla\.edu$/, "Please use a UCLA email."]
    },

    name: {
        type: String,
        required: true
    },

    isAdmin: {
        type: Boolean,
        default: false
    },

    verificationStatus: {
        type: String,
        enum: ["unverified", "pending", "verified", "rejected"],
        default: "unverified"
    },

    verificationImagePath: {
        type: String, 
        default: "",
    },

    verificationSubmitDate: {
        type: Date
    },

    verificationReviewDate: {
        type: Date
    },

    verificationRejectionReason: {
        type: String,
        default: ""
    }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);

