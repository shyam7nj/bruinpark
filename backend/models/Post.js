
const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    },

    startTime: {
      type: String,
      required: true,
      trim: true,
    },

    endTime: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
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
        type: [scheduleSchema],
        required: true,
        default: [],
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