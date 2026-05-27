import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import busRoutes from "./routes/bus.routes";
import availabilityRoutes from "./routes/availability.routes";

dotenv.config();

const app = express();

// Middleware
app.use(cors()); // REQUIRED: Allows frontend (port 5173) to talk to backend (port 5000)
app.use(express.json());

// Database connection with proper configuration
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  throw new Error('MONGO_URI is not configured');
}

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err.message);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api', busRoutes);
app.use('/api', availabilityRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await mongoose.connect(mongoUri as string, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('MongoDB connected successfully');

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err: any) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}

void startServer();
