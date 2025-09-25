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

router.post('login', async (req, res) => {
    try {
        // check if the information in req.body is correct
        // find user with matching username
        const user = await UserModel.findOne({username: req.body.username});
        if(!user) {
            throw new Error('Incorrect username');
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
            return res.json(token);
        }
        throw new Error('Incorrect password');
    }
    catch(err) {
        console.log((err as Error).message);
    }
})

export default router;