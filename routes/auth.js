require('dotenv').config();
const express = require('express');
const router = express.Router();
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/auth')

const User = require('../models/User');

router.get('/', verifyToken, async (req, res) => {
	try {
		const user = await User.findById(req.userId).select('-password')
		if (!user)
			return res.status(400).json({ success: false, message: 'User not found' })
		res.json({ success: true, user })
	} catch (error) {
		console.log(error)
		res.status(500).json({ success: false, message: 'Internal server error' })
	}
})

//POST api/auth/register
router.post('/register', async (req, res) => {
    const {username, password} = req.body;

    //Simple validation
    if(!username || !password)
        return res.status(400).json({success: false, message: 'Missing username or password'});
    
    try{
        //check username exists
        const user = await User.findOne({username});

        if(user) 
            return res.status(400).json({success: false, message: 'Username already exists'});

        const hashedPassword = await argon2.hash(password);
        
        //all good and register
        const newUser = new User({
            username,
            password: hashedPassword,
        });
        await newUser.save();

        //return token jwt
        const accessToken = jwt.sign({userId: newUser._id}, process.env.ACCESS_TOKEN_SECRET);

        res.json({success: true, message:'Register Successfully', accessToken});

    } catch(err) {
        console.error(err);
        res.status(500).json({ success: false, message:'Internal server Error'});
    }
});

//POST api/auth/login
router.post('/login', async(req, res) => {
    const {username, password} = req.body;

    if(!username || !password)
        return res.status(400).json({success: false, message: 'Missing username or password'});

    try {
        //check username
        const user = await User.findOne({username});
        if(!user) 
            return res.status(400).json({success: false, message: 'Username or password does not exist'});
            
        //if username found and check password
        const passwordValid = await argon2.verify(user.password, password); 
        if(!passwordValid)
            return res.status(400).json({success: false, message: 'Username or password does not exist'});

        //all good and return
        const accessToken = jwt.sign({userId: user._id}, process.env.ACCESS_TOKEN_SECRET);
        res.json({success: true, message:'Login Successfully', accessToken});

    } catch(err) {
        console.error(err);
        res.status(500).json({success: false, message: 'Internal Server Error'});
    }

});

module.exports = router;