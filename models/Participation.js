const mongoose = require('mongoose');

const ParticipationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room', // Reference to the Room model
        required: true
    },
    joinedDate: {
        type: Date,
        default: Date.now // Defaults to the current date and time when the participation is created
    },
    groupNumber: { 
            type: Number, 
            default: 0 
    },
});

const Participation = mongoose.model('Participation', ParticipationSchema);

module.exports = Participation;