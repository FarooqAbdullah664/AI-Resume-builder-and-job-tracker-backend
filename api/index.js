import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes   from '../routes/authRoutes.js';
import resumeRoutes from '../routes/resumeRoutes.js';
import jobRoutes    from '../routes/jobRoutes.js';

dotenv.config();

const app = express();

// ── CORS ─────────────────────────────────────
// Frontend ka Vercel URL allow karo
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:5000',
  // 🔧 Frontend deploy hone ke baad yahan add karo:
  'https://resumeai-frontend.vercel.app',
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true); // Development mein sab allow
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── MongoDB (cached connection for serverless) ─
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 30000,
    });
    isConnected = true;
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB Error:', err.message);
    throw err;
  }
};

// ── Middleware: connect DB before every request ─
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ message: 'Database connection failed' });
  }
});

// ── Routes ────────────────────────────────────
app.use('/api/auth',   authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/jobs',   jobRoutes);

// Health check
app.get('/api', (req, res) => {
  res.json({ status: 'ok', message: 'ResumeAI API is running' });
});

// ── 404 ───────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` });
});

// ── Error handler ─────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

export default app;
