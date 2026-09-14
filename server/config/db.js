import mongoose from 'mongoose';

function getMongoUri() {
  return process.env.MONGO_URI?.trim() || '';
}

function redactSecrets(message) {
  return String(message).replace(/mongodb(\+srv)?:\/\/[^\s"'`]+/gi, '[redacted]');
}

function assertMongoUri(mongoUri) {
  if (!mongoUri) {
    throw new Error(
      'MONGO_URI is missing. Set it in server/.env using your MongoDB Atlas connection string. The server will not start without a database connection.',
    );
  }

  if (/<[^>]+>/.test(mongoUri)) {
    throw new Error(
      'MONGO_URI still contains placeholder values (for example <username>, <password>, or <cluster>). Replace them in server/.env with the real connection string from MongoDB Atlas. The server will not start until this is a valid URI.',
    );
  }

  if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
    throw new Error(
      'MONGO_URI is invalid. It must start with mongodb:// or mongodb+srv://. Update server/.env and try again.',
    );
  }
}

export async function connectDB() {
  const mongoUri = getMongoUri();
  assertMongoUri(mongoUri);

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });

    const { host, name } = mongoose.connection;
    console.log(`MongoDB connected (${host} / ${name})`);

    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', redactSecrets(error.message));
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });

    return mongoose.connection;
  } catch (error) {
    throw new Error(`MongoDB connection failed: ${redactSecrets(error.message)}`);
  }
}

export async function disconnectDB() {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.connection.close();
  console.log('MongoDB connection closed');
}
