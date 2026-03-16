# Authentication API

A secure, production-ready REST API for user authentication built with Node.js, Express, and MongoDB.

## Features
- User Registration and Login
- JWT-based Authentication (Access Token & Refresh Token)
- HTTP-Only secure cookies for refresh tokens
- Get Current User Profile (`/get-me`)
- Token Refresh Mechanism (`/refresh`)
- User Logout API

## Prerequisites
- Node.js installed
- MongoDB installed and running

## Getting Started

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Set up environment variables**:
   Copy `.env.example` to `.env` and fill in your values.
   ```bash
   cp .env.example .env
   ```
4. **Run the development server**:
   ```bash
   npm run dev
   ```

## API Endpoints

### 1. Register
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "username": "exampleuser",
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```

### 2. Login
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```
*Returns an access token and sets an HTTP-Only cookie containing the refresh token.*

### 3. Get Current User
- **URL**: `/api/auth/get-me`
- **Method**: `GET`
- **Headers**:
  - `Authorization: Bearer <access_token>`

### 4. Refresh Token
- **URL**: `/api/auth/refresh`
- **Method**: `GET`
*Requires the `refreshToken` cookie set during login. Returns a new access token.*

### 5. Logout
- **URL**: `/api/auth/logout`
- **Method**: `POST`
*Clears the `refreshToken` cookie.*

## License
ISC
