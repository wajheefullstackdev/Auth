import app from "./src/app.js";
import config from "./src/config/config.js";
import connectDB from "./src/config/db.js";

connectDB();

const server = app.listen(config.PORT, () => {
    console.log(`Server running in ${config.NODE_ENV} mode on port ${config.PORT}`);
});

// Graceful shutdown for Railway / Render
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Process terminated.');
        process.exit(0);
    });
});