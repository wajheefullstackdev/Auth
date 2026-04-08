import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import config from './config/config.js';
import authRoutes from './routes/auth.routes.js';
import expenseRoutes from './routes/expense.routes.js';
import groupRoutes from './routes/group.routes.js';

const app = express();

// Security headers
app.use(helmet());

// CORS — allow the Vercel frontend
app.use(cors({
    origin: config.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting — 100 requests per 15 minutes per IP
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// HTTP logging (dev only)
if (config.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// Health check
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/groups', groupRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        message: err.message || 'Internal server error',
        ...(config.NODE_ENV !== 'production' && { stack: err.stack }),
    });
});

export default app;
