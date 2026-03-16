import dotenv from 'dotenv';
dotenv.config();

const config = {
    PORT: 3000,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET
}

export default config;