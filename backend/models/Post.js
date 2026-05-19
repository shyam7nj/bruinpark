
const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    monday: {
        type: [String],
        default: [],
    },
    tuesday: {
        type: [String],
        default: [],
    },
    wednesday: {
        type: [String],
        default: [],
    },
    thursday: {
        type: [String],
        default: [],
    },
    friday: {
        type: [String],
        default: [],
    },
}, {_id: false}
);

const postSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    parkingStructure: {
        type: String,
        required: true,
        trim: true,
    },

    schedule: {
        type: scheduleSchema,
        required: true,
        default: () => ({}),    // Create an empty Schedule object if none is provided
    },

    notes: {
        type: String,
        trim: true,
        maxLength: 500, 
        default: '',
    }
}, {timestamps: true}
);

module.exports = mongoose.model('Post', postSchema);