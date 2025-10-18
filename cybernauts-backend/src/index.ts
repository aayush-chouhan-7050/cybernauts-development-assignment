// src/index.ts - Updated with pagination routes
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { CorsOptions } from 'cors';
import userRoutes from './routes/user.routes';
import { handleGetGraphData } from './controllers/user.controller';
import cluster from 'cluster';
import os from 'os';

dotenv.config();

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const DB_URL = process.env.DB_URL;
  const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN_URL;

  const corsOptions: CorsOptions = {
    origin: FRONTEND_ORIGIN,
  };

  app.use(cors(corsOptions));
  app.use(express.json());

  // API Routes
  app.use('/api/users', userRoutes);
  
  // Graph endpoint with pagination support
  app.get('/api/graph', handleGetGraphData);

  // Health check
  app.get('/', (req, res) => {
    res.send('API is running...');
  });

  if (!DB_URL) {
    console.error('Error: DB_URL is not defined in the .env file');
    process.exit(1);
  }

  mongoose
    .connect(DB_URL)
    .then(() => {
      console.log('Successfully connected to MongoDB.');
      app.listen(PORT, () => {
        console.log(
          `Worker ${process.pid} started, server is running on port ${PORT}`
        );
      });
    })
    .catch((error) => {
      console.error('Error connecting to MongoDB:', error);
    });
}