// src/index.ts
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from './routes/user.routes';
import { handleGetGraphData } from './controllers/user.controller';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DB_URL;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN_URL;

// CORS options
const corsOptions = {
  origin: FRONTEND_ORIGIN
};

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
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });