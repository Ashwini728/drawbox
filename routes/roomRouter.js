const express = require('express');
const router = express.Router();

const {
    createRoom,
    getRoom,
    getUserRooms,
    getUserOwnedRooms,
    joinRoom,
    groupParticipants,
    selectWinner,
    finalizeRoom,
    checkRoomStatus,
    getParticipants,
    getGroup,
} = require('../controllers/RoomController');

router.post('/', createRoom);
router.get('/joinedRooms', getUserRooms);
router.get('/myRooms', getUserOwnedRooms);
router.get('/:roomId', getRoom);
router.post('/:roomId/join', joinRoom);
router.post('/:roomId/group', groupParticipants);
router.post('/:roomId/winner', selectWinner);
router.post('/:roomId/finalize', finalizeRoom);
router.get('/:roomId/status', checkRoomStatus)
router.get('/:roomId/participants', getParticipants);
router.get('/:roomId/group/', getGroup);

module.exports = router;