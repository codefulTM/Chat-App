import express from 'express';
import UserModel from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/login', async (req, res) => {
    try {
        // check if the information in req.body is correct
        // find user with matching email
        const user = await UserModel.findOne({email: req.body.email});
        if(!user) {
            return res.json({success: false, message: 'Incorrect email'});
        }

        // get the user's hashed password
        const hashedPassword = user.password;

        // compare the hashed password with the password in req.body
        // if the information is correct -> return a jwt token
        if(bcrypt.compareSync(req.body.password, hashedPassword)) {
            const token = jwt.sign({
                id: user._id,
                username: user.username,
                email: user.email,
                displayName: user.displayName
            }, process.env.JWT_SECRET!);
            return res.json({success: true, message: token});
        }
        return res.json({success: false, message: 'Incorrect password'});
    }
    catch(err) {
        return res.json({success: false, message: (err as Error).message});
    }
});

router.post('/register', async (req, res) => {
    try {
        if(!req.body.username && !req.body.email && !req.body.password && !req.body.displayName) {
            return res.json({
                success: false,
                message: 'All fields are required'
            });
        }

        if(req.body.displayName === '') {
            return res.json({
                success: false,
                message: 'Display name cannot be empty'
            });
        }

        let user = undefined;
        // if the username already exists -> throw error
        user = await UserModel.findOne({username: req.body.username});
        if(user) {
            return res.json({
                success: false,
                message: 'Username already exists'
            });
        }

        // if the email already exists -> throw error
        user = await UserModel.findOne({email: req.body.email});
        if(user) {
            return res.json({
                success: false,
                message: 'Email already exists'
            })
        }

        // hash password
        const hashedPassword = bcrypt.hashSync(req.body.password, 10);

        return res.json({
            success: true,
            message: await UserModel.create({
                username: req.body.username,
                email: req.body.email,
                password: hashedPassword,
                displayName: req.body.displayName,
                lastOnline: Date.now()
        })});
    }
    catch(err) {
        return res.json({success: false, message: (err as Error).message});
    }
});


export default router;