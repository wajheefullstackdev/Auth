import { Router } from "express";
import * as authControllers from "../controllers/auth.controller.js";

const authRoutes = Router();

authRoutes.post('/register', authControllers.register)
authRoutes.post('/login', authControllers.login)
authRoutes.get('/get-me', authControllers.getMe)
authRoutes.get('/refresh', authControllers.refreshToken)
authRoutes.post('/logout', authControllers.logout)

export default authRoutes;