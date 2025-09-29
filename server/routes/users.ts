import express from 'express';
import UserModel from '../models/User.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const name = typeof req.query.name === 'string' ? req.query.name : '';
    return res.json({
        success: true,
        message: await UserModel.find({
            displayName: { $regex: name, $options: 'i' }
        })
    });
})

export default router;