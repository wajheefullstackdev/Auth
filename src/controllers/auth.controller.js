import userModel from "../models/usermodel.js";
import crypto from "crypto";
import jwt from "jsonwebtoken"
import config from "../config/config.js";

export async function register(req, res) {
    try {
        const { username, email, password } = req.body;

        const isAlreadyRegistered = await userModel.findOne({
            $or: [
                { username },
                { email }
            ]
        });

        if (isAlreadyRegistered) {
            return res.status(409).json({ message: "Username or email already exists" });
        }

        const hashedPassword = crypto
            .createHash("sha256")
            .update(password)
            .digest("hex");

        const user = await userModel.create({
            username,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error during registration"
        });
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const hashedPassword = crypto
            .createHash("sha256")
            .update(password)
            .digest("hex");

        const isPasswordValid = hashedPassword === user.password;

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const refreshToken = jwt.sign(
            { id: user._id, username: user.username, email: user.email },
            config.JWT_SECRET,
            { expiresIn: "7d" }
        );

        const accessToken = jwt.sign(
            { id: user._id, username: user.username, email: user.email },
            config.JWT_SECRET,
            { expiresIn: "15m" }
        );

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            message: "User login sucessfully",
            user: {
                username: user.username,
                email: user.email
            },
            accessToken
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error during login"
        });
    }
}

export async function getMe(req, res) {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Token not found" });
        }

        const decoded = jwt.verify(token, config.JWT_SECRET);
        const user = await userModel.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "User fetched successfully",
            user: {
                username: user.username,
                email: user.email,
            }
        });

    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Access token expired" });
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token" });
        }

        return res.status(500).json({ message: "Server error" });
    }
}

export async function refreshToken(req, res) {
    try {
        const token = req.cookies.refreshToken;
        if (!token) {
            return res.status(401).json({ message: "Refresh token not found" });
        }

        const decoded = jwt.verify(token, config.JWT_SECRET);
        const user = await userModel.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        const accessToken = jwt.sign(
            {
                id: user._id,
                username: user.username,
                email: user.email
            },
            config.JWT_SECRET,
            { expiresIn: "15m" }
        );

        const newRefreshToken = jwt.sign(
            { id: user._id },
            config.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            message: "Access token refreshed successfully",
            accessToken
        });

    } catch (error) {
        res.status(401).json({ message: "Invalid refresh token" });
    }
}

export async function logout(req, res) {
    try {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "strict"
        });
        
        res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error during logout" });
    }
}