const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    roomName: {
        type: String,
        required: [true, 'Please provide room name'],
        trim: true,
        maxlength: [50, 'Room name cannot exceed 50 characters']
    },
    roomDescription: {
        type: String,
        required: [true, 'Please provide room description'],
        maxlength: [200, 'Room description cannot exceed 200 characters']
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide user ID']
    },
    status: { 
        type: String, 
        enum: ['open', 'closed'], 
        default: 'open' 
    },
    group_size: { 
        type: Number, 
        default: 0 
    },
});

const Room = mongoose.model('Room', RoomSchema);

module.exports = Room;