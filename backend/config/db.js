import mongoose from "mongoose";

const connectdb = async () => {
    try {
        let uri = process.env.MONGO_URI;
        const defaultDb = process.env.MONGO_DB_NAME || 'virtualassi';

        if (!uri) {
            console.warn('MONGO_URI is not set. Skipping MongoDB connection and using in-memory fallback for development.');
            return; // continue without DB
        }

        // If URI does not include an explicit database name, append a default DB name
        // e.g. mongodb+srv://user:pass@cluster0.example.net/  -> append defaultDb
        const hasDb = /\/[^\/\?]+(\?|$)/.test(uri.replace('mongodb+srv://', ''));
        if (!hasDb) {
            if (uri.endsWith('/')) uri = uri + defaultDb;
            else uri = uri + '/' + defaultDb;
            // Ensure common query params are present
            if (!uri.includes('?')) uri = uri + '?retryWrites=true&w=majority';
            console.log('Note: MONGO_URI did not include a database name. Appended default DB:', defaultDb);
        }

        await mongoose.connect(uri, {
            // Mongoose 8 defaults are fine; options kept explicit for clarity
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected');
    }
    catch (error) {
        console.error('MongoDB connection error:', error && error.message ? error.message : error);
        if (error && error.message && error.message.toLowerCase().includes('bad auth')) {
            console.error('Authentication failed. Verify MONGO_URI credentials, database name, and Atlas Network Access (IP whitelist).');
        }
        console.warn('Continuing without MongoDB; entering in-memory fallback mode for development.');
        // Do not exit: allow the server to run with fallbackDb in controllers
        return;
    }
};
export default connectdb;