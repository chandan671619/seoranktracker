import express from 'express';
import { register, login, getUser } from '../controller/authController.js';
import auth from '../middleware/auth.js';

const authRoutes = express.Router();
authRoutes.post('/register', register);
authRoutes.post('/login', login);
authRoutes.get('/user', auth, getUser);

export default authRoutes;