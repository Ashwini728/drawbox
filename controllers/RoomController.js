const express = require('express');

// Import room controller


const Room = require('../models/Room');
const Participation = require('../models/Participation');
const User = require('../models/User');

const createRoom = async (req, res) => {
    try {
        req.body.createdBy = req.user._id; // Add this line to set the creator
        console.log(req.body, req.user);
        const room = await Room.create(req.body);
        res.status(201).json({
            success: true,
            room
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Failed to create room'
        });
    }
};

const getUserRooms = async (req, res) => {
    try {
        const participations = await Participation.find({ 
            userId: req.user._id 
        }).populate('roomId');

        const rooms = participations.map(p => p.roomId);

        res.status(200).json({ 
            success: true, 
            count: rooms.length,
            rooms 
        });
    } catch (error) {
        console.error('Get user rooms error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user rooms'
        });
    }
};

const getUserOwnedRooms = async (req, res) => {
    try {
        const rooms = await Room.find({ createdBy: req.user._id })
            .sort('-createdDate');

        res.status(200).json({
            success: true,
            count: rooms.length,
            rooms
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve user owned rooms',
            error: error.message
        });
    }
};

const getRoom = async (req, res) => {
    try {
        const { roomId } = req.params;

        // Check if user is participant
        const participation = await Participation.findOne({
            userId: req.user._id,
            roomId
        });

        if (!participation) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: Not a participant of this room'
            });
        }

        const room = await Room.findById(roomId);
        
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        res.status(200).json({ 
            success: true, 
            room 
        });
    } catch (error) {
        console.error('Get room error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch room'
        });
    }
};


const joinRoom = async (req, res) => {
    try {
        const { roomId } = req.params;

        // Check if room exists
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        // Check if already a participant
        const existingParticipation = await Participation.findOne({
            userId: req.user._id,
            roomId
        });

        if (existingParticipation) {
            return res.status(400).json({
                success: false,
                message: 'Already a participant in this room'
            });
        }

        const participation = await Participation.create({
            userId: req.user._id,
            roomId
        });

        res.status(201).json({ 
            success: true, 
            participation 
        });
    } catch (error) {
        console.error('Join room error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to join room'
        });
    }
};


const groupParticipants = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { groupSize } = req.body; // Get group size from the request body

        // Find the room
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        // Ensure only the creator can group participants
        if (!room.createdBy.equals(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to group participants'
            });
        }

        // Validate group size input
        if (groupSize < 1) {
            return res.status(400).json({
                success: false,
                message: 'Group size must be at least 1'
            });
        }

        // Update room's group size
        room.group_size = groupSize; // Save the new group size to the room
        await room.save(); // Save room document

        // Fetch participants for the room
        const participants = await Participation.find({ roomId });

        if (groupSize > 1) {
            const shuffledParticipants = participants.sort(() => 0.5 - Math.random()); // Shuffle participants
            
            // Group participants according to group size
            for (let i = 0; i < shuffledParticipants.length; i++) {
                const groupNumber = Math.floor(i / groupSize) + 1; // Calculate group number
                shuffledParticipants[i].groupNumber = groupNumber; // Assign group number
                await shuffledParticipants[i].save(); // Save each participation
            }

            return res.status(200).json({
                success: true,
                message: 'Participants have been grouped.',
                groups: shuffledParticipants
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Group size must be greater than 1 to group participants.'
            });
        }

    } catch (error) {
        console.error('Group participants error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to group participants'
        });
    }
};


const selectWinner = async (req, res) => {
    try {
        const { roomId } = req.params;

        // Find the room
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        // Ensure only the creator can select a winner
        if (!room.createdBy.equals(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to select a winner'
            });
        }

        // Fetch participants for the room
        const participants = await Participation.find({ roomId });
        
        if (participants.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No participants to select a winner from'
            });
        }

        // Select a random winner
        const winnerIndex = Math.floor(Math.random() * participants.length);
        const winner = participants[winnerIndex];

        // Reset previous group numbers and assign the winner
        await Participation.updateMany({ roomId }, { groupNumber: 0 }); // Reset group numbers for all participants
        winner.groupNumber = 1; // Set the winner's group number to 1

        // Set room group_size to 1 (winner)
        room.group_size = 1;

        // Save both the winner and the room (group size update)
        await winner.save();
        const updatedRoom = await room.save(); // Ensure this save reflects the changes

        const { username } = await  User.findById(winner.userId).select(  'username');

        return res.status(200).json({
            success: true,
            message: 'Winner selected.',
            winnerId: winner.userId, // Assuming userId contains the winner's ID
            winnerUsername: username,
        });

    } catch (error) {
        console.error('Select winner error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to select winner'
        });
    }
};


const finalizeRoom = async (req, res) => {
    try {
        const { roomId } = req.params;

        // Find the room
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        // Ensure only the creator can finalize the room
        if (!room.createdBy.equals(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to finalize this room'
            });
        }

        // Update room status to closed
        room.status = 'closed';
        await room.save();

        res.status(200).json({
            success: true,
            message: 'Room finalized successfully.'
        });

    } catch (error) {
        console.error('Finalize room error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to finalize room'
        });
    }
};

const checkRoomStatus = async (req, res) => {
    try {
        const { roomId } = req.params;

        // Find the room
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        // Check if user is a participant in the room
        const participation = await Participation.findOne({
            userId: req.user._id,
            roomId
        });

        if (!participation) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: Not a participant of this room'
            });
        }

        // Determine the status based on the room's group size and participation group number
        if (room.status === 'closed') {
            // Check if a winner was chosen
            if (room.group_size === 1) {
                if (participation.groupNumber === 1){
                    return res.status(200).json({
                        type: "draw",
                        winner: true
                    });
                } else {
                    return res.status(200).json({
                        type: "draw",
                        winner: false
                    });
                }
            } else if (room.group_size > 1) {
                // Room is still open, check group number
                return res.status(200).json({
                    type: "grouped",
                    groupNumber: participation.groupNumber
                });
            }
        } else {
            // No grouping or winner selected yet
            return res.status(200).json({
                success: false,
                message: 'No grouping or winner has been determined yet.'
            });
        }
    } catch (error) {
        console.error('Check room status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check room status'
        });
    }
};

const getParticipants = async (req, res) => {
    try {
        const { roomId } = req.params;

        // Find the room to ensure it exists
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        // Check if the user requesting is the creator of the room
        if (!room.createdBy.equals(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: Only the creator can view participants'
            });
        }

        // Fetch participants for the room and populate usernames
        const participants = await Participation.find({ roomId })
            .populate('userId', 'username'); // Populate with user information, showing only the username

        // Extract only usernames
        const usernames = participants.map(participant => participant.userId.username);

        res.status(200).json({
            success: true,
            count: usernames.length,
            usernames // Return only usernames array
        });
    } catch (error) {
        console.error('Get participants error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve participants'
        });
    }
};   

const getGroup = async (req, res) => {
    try {
        const { roomId } = req.params; // Get roomId from the route parameters
        const { groupNumber } = req.query; // Get group number from query parameters

        // Validate the group number
        if (!groupNumber) {
            return res.status(400).json({
                success: false,
                message: 'Group number is required'
            });
        }

        // Find the room
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        // Ensure the room is closed and group size is greater than 1
        if (room.status !== 'closed' || room.groupSize <= 1) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized'
            });
        }

        // Fetch participants for the room with the specified group number
        const participants = await Participation.find({
            roomId,
            groupNumber: groupNumber // Filter by group number
        }).populate('userId', 'username'); // Populate userId to get only the username

        // Extract only usernames from participants
        const usernames = participants.map(participant => participant.userId.username);

        if (usernames.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No participants found for this group number.',
                usernames: []
            });
        }

        res.status(200).json({
            success: true,
            usernames // Return only the usernames of participants with the specified group number
        });
    } catch (error) {
        console.error('Get participants by group number error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve participants'
        });
    }
};


module.exports = {
    createRoom,
    getUserOwnedRooms,
    getRoom,
    getUserRooms,
    joinRoom,
    groupParticipants,
    selectWinner,
    finalizeRoom,
    checkRoomStatus,
    getParticipants,
    getGroup
};