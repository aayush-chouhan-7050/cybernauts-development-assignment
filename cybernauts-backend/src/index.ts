// src/index.ts
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { CorsOptions } from 'cors';
import userRoutes from './routes/user.routes';
import { handleGetGraphData } from './controllers/user.controller';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DB_URL;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN_URL;

// CORS options - FIXED VERSION
const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      FRONTEND_ORIGIN,
      'https://cybernauts-development-assignment.vercel.app',
      /^https:\/\/cybernauts-development-assignment-.*\.vercel\.app$/  // Vercel preview deployments
    ];

    // Check if origin matches any allowed pattern
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return allowedOrigin === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(null, false); // Changed from throwing error to just returning false
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Middleware to parse JSON bodies
app.use(express.json());

// API Routes
app.use('/api/users', userRoutes);
app.get('/api/graph', handleGetGraphData);

// Basic route for health check
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Connect to MongoDB and start the server
if (!DB_URL) {
  console.error("Error: DB_URL is not defined in the .env file");
  process.exit(1);
}

mongoose.connect(DB_URL)
  .then(() => {
    console.log('Successfully connected to MongoDB.');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });