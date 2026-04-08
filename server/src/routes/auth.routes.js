import { Router } from "express";
import * as authControllers from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const authRoutes = Router();

authRoutes.post('/register', authControllers.register)
authRoutes.post('/login', authControllers.login)
authRoutes.get('/get-me', authControllers.getMe)
authRoutes.get('/refresh', authControllers.refreshToken)
authRoutes.post('/logout', authControllers.logout)
authRoutes.put('/profile', protect, authControllers.updateProfile)
authRoutes.get('/search-users', protect, authControllers.searchUsers)

export default authRoutes;