const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');

const Room = require('../models/Room');

//GET api/post
//access Private
router.get('/', verifyToken, async(req, res) => {
    try {
        const room = await Room.find({user: req.userId}).populate('user', ['username']) 
        await res.json({success: true, room});
    } catch (err) {
        console.error(err);
        res.status(500).json({success: false, message: 'Internal server error'});
    }
});



//POST api/post
//create post
//access Private
router.post('/',verifyToken, async (req, res) => {
    const {roomName} = req.body;

    if(!roomName)
        return res.status(400).json({success: false, message: 'room name is required'});

    try{
        const newRoom = new Room({
            name: roomName,
            devices: []
        });
        await newRoom.save();

        res.json({success: true, message: 'Room was created successfully', room: newRoom});

    } catch(err) {
        console.error(err);
        res.status(500).json({success: false, message: 'Internal server error'});
    }
});


//PUT api/post/
//update post
//access Private
router.put('/:id', verifyToken, async (req, res) => {
    const {deviceName, type, status} = req.body;

    if(!deviceName) 
        return res.status(400).json({success: false, message: "Device name is required"}); 

    try{
        let newDevice = {
            "name": deviceName,
            "type": type,
            "status": status
        }

        const addDeviceCondition =  {_id: req.params.id, user: req.userId}

        const updateRoom = await Room.findOneAndUpdate(addDeviceCondition, { $push: { devices: newDevice  } }, {new: true});

        //check dieu kien, khi ma post vua ko co id = param vua ko co id = req.userId

        if(!updateRoom) 
            return res.status(401).json({success: false, message: 'Post not found or you dont have enough permit to update this post'});

        res.json({success: true, message:'Add Device Successfully', device: updateRoom});
    } catch(err){
        console.error(err);
        res.status(500).json({success: false, message: 'Internal server error'});
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