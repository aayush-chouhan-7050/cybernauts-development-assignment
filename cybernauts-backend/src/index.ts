// src/index.ts - Updated with Redis integration
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { CorsOptions } from 'cors';
import userRoutes from './routes/user.routes';
import { handleGetGraphData } from './controllers/user.controller';
import cluster from 'cluster';
import os from 'os';
import {
  initRedis,
  closeRedis,
  subscribeToEvents,
  CHANNELS,
  isRedisAvailable,
} from './config/redis';

dotenv.config();

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);
  console.log(`Forking ${numCPUs} workers...`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
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
  app.get('/api/graph', handleGetGraphData);

  // Health check with Redis status
  app.get('/', (req, res) => {
    res.json({
      status: 'API is running',
      worker: process.pid,
      redis: isRedisAvailable() ? 'connected' : 'disabled',
    });
  });

  // Redis status endpoint
  app.get('/api/status', (req, res) => {
    res.json({
      worker: process.pid,
      redis: isRedisAvailable(),
      uptime: process.uptime(),
    });
  });

  if (!DB_URL) {
    console.error('Error: DB_URL is not defined in the .env file');
    process.exit(1);
  }

  // Initialize everything
  const startServer = async () => {
    try {
      // Connect to MongoDB
      await mongoose.connect(DB_URL);
      console.log(`Worker ${process.pid}: MongoDB connected`);

      // Initialize Redis
      await initRedis();

      // Setup event listeners for state synchronization
      if (isRedisAvailable()) {
        await subscribeToEvents((channel, data) => {
          console.log(
            `Worker ${process.pid} received event on ${channel}:`,
            data
          );
          // Events are handled in services, this is just for monitoring
        });
      }

      // Start server
      app.listen(PORT, () => {
        console.log(
          `Worker ${process.pid} started on port ${PORT}`
        );
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  };

  startServer();

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log(`Worker ${process.pid} shutting down...`);
    await closeRedis();
    await mongoose.connection.close();
    process.exit(0);
  });
}