import jwt from "jsonwebtoken";
import config from "../config/config.js";
import userModel from "../models/usermodel.js";

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.refreshToken) {
        token = req.cookies.refreshToken;
    }
    if (!token) {
        return res.status(401).json({ message: "Not authorized to access this route" });
    }
    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        req.user = await userModel.findById(decoded.id).select("-password");
        if (!req.user) {
            return res.status(401).json({ message: "User not found" });
        }

        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired" });
        }
        return res.status(401).json({ message: "Not authorized to access this route" });
    }
};
