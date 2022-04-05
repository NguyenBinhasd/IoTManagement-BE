const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');

const Room = require('../models/Room');


router.get('/', verifyToken, async (req, res) => {
    try{
        const room = await Room.find({user: req.userId}).populate('user', ['username']);

        await res.json({success: true, room});
    } catch(err) {
        console.log(err);
        res.status(500).json({success: false, message: "Internal server error"});
    }
});




router.post('/', verifyToken, async (req, res) => {
    const {roomName} = req.body;

    if(!roomName) 
        return res.status(400).json({success: false, message:"Room name is required"});

    try{
        const newRoom = new Room({
            name: roomName,
            devices: [],
            user: req.userId
        });
        await newRoom.save();
        res.json({success: true, message: "Room created successfully", room: newRoom});

    } catch (err) {
        console.log(err);
        res.status(500).json({success: false, message:"Internal server error"});
    }
});


router.put('/:id', verifyToken, async (req, res) => {
    const {deviceName, type, status} = req.body;

    if(!deviceName)
        return res.status(400).json({success: false, message:"Device name is required"});

    try {
        let newDevice = {
            "name": deviceName,
            "type": type,
            "status": status
        }

        const addDeviceCondition = {_id: req.params.id, user: req.userId}

        newDevice = await Room.findOneAndUpdate(addDeviceCondition, {$push: {devices: newDevice}},{ new: true });

        if(!newDevice) 
            return res.status(401).json({success: false, message: 'Room not found or you dont have enough permit to add more devices'});

        res.json({success: true, message: "Add device Successfully", device: newDevice});

    } catch (err) {
        console.log(err);
        res.status(500).json({success: false, message:"Internal server error"});
    }

});


//DELETE api/post/
//access Private
router.delete('/:id', verifyToken, async (req, res) => {
    try{
        const deleteCondition = {_id: req.params.id, user: req.userId}
        const deleteRoom = await Room.findOneAndDelete(deleteCondition);

        if(!deleteRoom) 
            return res.status(401).json({success: false, message: 'You dont have permit to delete this room'});

        res.json({success: true, message: 'Room deleted successfully', room: deleteRoom});
    } catch(err) {
        console.error(err);
        res.status(500).json({success: false, message: 'Internal server error'});s
    }
});

module.exports = router;