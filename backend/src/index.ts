import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import * as db from './db';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

// Check configuration
if (!INTERNAL_API_KEY) {
  console.warn('⚠️ WARNING: INTERNAL_API_KEY is not defined in the environment. API is unsecured!');
}

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Middleware to verify internal API key
app.use((req, res, next) => {
  const clientApiKey = req.headers['x-api-key'];
  
  if (INTERNAL_API_KEY && clientApiKey !== INTERNAL_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
  }
  next();
});

// Generic RPC route
app.post('/rpc', (req, res) => {
  const { method, args = [] } = req.body;

  if (!method) {
    return res.status(400).json({ error: 'Method name is required' });
  }

  const dbMethod = (db as any)[method];

  if (typeof dbMethod !== 'function') {
    return res.status(404).json({ error: `Database method '${method}' not found` });
  }

  try {
    let result = dbMethod(...args);
    
    // Serialise Set to Array for JSON transmission
    if (result instanceof Set) {
      result = Array.from(result);
    }
    
    res.json({ result });
  } catch (error: any) {
    console.error(`Error executing database method '${method}':`, error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', database: 'connected' });
});

app.listen(PORT, () => {
  console.log(`🚀 UniPulse backend server running on http://localhost:${PORT}`);
});
