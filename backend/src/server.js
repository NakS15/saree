require('dotenv').config();
const mongoose = require('mongoose');
const http = require('http');
const app = require('./app');
const logger = require('./config/logger');

const PORT = process.env.PORT || 5000;

// ─── Connect to MongoDB then start server ─────────────────────────────────────
const start = async () => {
  try {
    console.log('Connecting to MongoDB:', process.env.MONGO_URI ? 'URI found' : 'URI MISSING');
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    logger.info(`✅ MongoDB connected: ${conn.connection.host}`);

    const server = http.createServer(app);

    server.listen(PORT, () => {
      logger.info(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      logger.info(`📡 API available at http://localhost:${PORT}/api/v1`);
    });

    // ─── Graceful shutdown ────────────────────────────────────────────────────
    const shutdown = async (signal) => {
      logger.info(`\n${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // ─── Unhandled rejections ─────────────────────────────────────────────────
    process.on('unhandledRejection', (err) => {
      console.error(`Unhandled Rejection: ${err.message}`);
      console.error(err.stack);
      server.close(() => process.exit(1));
    });

  } catch (err) {
    console.error(`❌ Failed to connect to MongoDB: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  }
};

start();