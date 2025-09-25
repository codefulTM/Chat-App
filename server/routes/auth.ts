import express from 'express';
import UserModel from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('register', async (req, res) => {
    try {
        if(!req.body.username && !req.body.email && !req.body.password && !req.body.displayName) {
            throw new Error('All fields are required');
        }

        if(req.body.displayName === '') {
            throw new Error('Display name cannot be empty');
        }

        let user = undefined;
        // if the username already exists -> throw error
        user = await UserModel.findOne({username: req.body.username});
        if(user) {
            throw new Error('Username already exists');
        }

        // if the email already exists -> throw error
        user = await UserModel.findOne({email: req.body.email});
        if(user) {
            throw new Error('Email already exists');
        }

        // hash password
        const hashedPassword = bcrypt.hashSync(req.body.password, 10);

        res.json(await UserModel.create({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            displayName: req.body.displayName,
            lastOnline: Date.now
        }));
    }
    catch(err) {
        console.log((err as Error).message);
    }
});

router.post('login', (req, res) => {
    try {
        // check if the information in req.body is correct
        // if the information is incorrect -> throw error

        // if the information is correct -> return a jwt token
    }
    catch(err) {
        console.log((err as Error).message);
    }
})

export default router;