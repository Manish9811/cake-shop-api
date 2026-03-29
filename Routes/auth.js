import express from 'express';
import { Register } from '../Controllers/Auth.js';
import { Login, CheckAuth,Logout,sendOtp } from '../Controllers/Auth.js';


const router = express.Router();

router.post('/register', Register);
router.post('/login', Login);
router.get('/check-auth', CheckAuth);
router.get('/logout', Logout); // Optional logout route
router.post('/sendOtp', sendOtp); // Optional route to send OTP
export {router as AuthRouter};