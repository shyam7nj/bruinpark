
const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },

    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    message: {
        type: String, 
        trim: true,
        maxLength: 500,
        default: ""
    },

    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
    }, 

    reviewedAt: {
        type: Date
    }

}, {timestamps: true} );

module.exports = mongoose.model('Message', messageSchema);