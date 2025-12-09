import { jwtPayload } from "../dto/authDTO";
import jwt from 'jsonwebtoken';
import { envValues } from "./envParser";

const jwtSecret = envValues.JWT_SECRET!;
const jwtExpiry = envValues.JWT_EXPIRY!; 

export const signToken = (jwtPayload: jwtPayload): string => {
    return jwt.sign(jwtPayload, jwtSecret, {expiresIn: '30d'})
}

export const verifyToken = (token: string): jwtPayload => {
    return jwt.verify(token, jwtSecret) as jwtPayload;
}