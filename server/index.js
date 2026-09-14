import { env, validateEnv } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import app from './app.js';

validateEnv();

let server;

async function startServer() {
  try {
    await connectDB();

    server = app.listen(env.port, () => {
      console.log(`Server running on http://localhost:${env.port}`);
      console.log(`Health check: http://localhost:${env.port}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

async function shutdown(signal) {
  console.log(`Received ${signal}. Shutting down gracefully...`);

  if (server) {
    await new Promise((resolve) => {
      server.close(resolve);
    });
  }

  try {
    await disconnectDB();
  } catch (error) {
    console.error('Error while closing MongoDB:', error.message);
  }

  process.exit(0);
}

process.on('SIGINT', () => {
  shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  shutdown('SIGTERM');
});

startServer();
