import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

(async () => {
  const uri = process.env.MONGO_URI;
  console.log('Using MONGO_URI:', uri ? (uri.replace(/:[^:]+@/, ':*****@')) : uri);
  if (!uri) {
    console.error('No MONGO_URI found in .env');
    process.exit(1);
  }
  try {
    await mongoose.connect(uri, { connectTimeoutMS: 10000 });
    console.log('Connected to MongoDB successfully');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('MongoDB connect error (full):', err);
    console.error('MongoDB connect error (message):', err && err.message ? err.message : err);
    process.exit(1);
  }
})();