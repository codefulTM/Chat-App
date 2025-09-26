import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const jwtMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.header('authorization');
    if(!authHeader) {
        return res.sendStatus(401);
    }
    const token = authHeader.split(' ')[1];
    if(!token) {
        return res.sendStatus(401);
    }
    try {
        const user = jwt.verify(token, process.env.JWT_SECRET!);
        req.user = user;
        return next();
    }
    catch(err) {
        return res.sendStatus(403);
    }
}

export default jwtMiddleware;