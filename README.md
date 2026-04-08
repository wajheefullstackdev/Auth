# Full-Stack Expense Tracker with Authentication

This project is a complete, production-ready full-stack application for tracking personal expenses. It features a secure NodeJS API and a beautiful, modern React Frontend leveraging Redux.

## Features

- **Authentication System**: Secure JWT-based Login and Registration.
- **Glassmorphism UI**: Beautiful, premium, and responsive Vite React Frontend.
- **Expense Summaries**: Instantly tracks total, yearly, and monthly expenses using optimized MongoDB Aggregation pipelines.
- **State Management**: Robust Redux Toolkit handling asynchronous data fetching and state persistence.

## Technologies Used

- **Backend**: Node.js, Express, MongoDB, Mongoose, JSON Web Tokens (JWT).
- **Frontend**: React (Vite), Redux Toolkit, React Router v6, Tailwind CSS, Lucide Icons.

## Setup Instructions

### Prerequisites
- Node.js installed on your machine.
- MongoDB running locally or a MongoDB Atlas URI.

### 1. Backend Setup

1. Open a terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Ensure your `.env` file is configured properly:
   ```env
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_key
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup

1. Open a **second terminal** and navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
4. The React application will typically be accessible at `http://localhost:5173`. 
5. All backend requests sent to `/api` from the frontend are automatically proxied to the backend running on port `3000`.

## Testing

You can use the frontend UI to register a new user, log in, and add expenses to view the beautifully animated summary updates in real-time.
