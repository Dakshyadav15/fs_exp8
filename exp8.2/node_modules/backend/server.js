const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const PORT = 4000;

// --- Middleware ---
// Allow requests from our Vite frontend (running on port 5173)
app.use(cors({ origin: 'http://localhost:5173' })); 
app.use(express.json()); // Allow the server to understand JSON

// --- "Database" & Secret Key ---
const users = [
  {
    id: 1,
    username: 'user',
    // Hashed version of "password123"
    passwordHash: '$2b$10$mLEiVNWHHdGpFC6X1g2hn.rcgVSLCQ7G5Z3WFRYFlIqgu6wdHxaoa' 
  }
];
// This MUST be in a .env file in a real app
const JWT_SECRET = 'your-super-secret-key-that-is-very-long-and-secure';

// --- Verification Middleware ---
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (token == null) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token is invalid' });
    }
    req.user = user; // Attach user payload to request
    next(); // Proceed to the protected route
  });
}

// --- Routes ---

/**
 * @route   POST /login
 * @desc    Public route to log in and get a JWT
 */
app.post('/login', async (req, res) => {
  // --- START DEBUGGING ---
  console.log('--- Login Attempt ---');
  console.log('Received body:', req.body);
  // --- END DEBUGGING ---

  const { username, password } = req.body;

  // Find user
  const user = users.find(u => u.username === username);
  if (!user) {
    // --- START DEBUGGING ---
    console.log('Login failed: User not found');
    // --- END DEBUGGING ---
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // --- START DEBUGGING ---
  console.log('User found:', user.username);
  // --- END DEBUGGING ---

  // Check password
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    // --- START DEBUGGING ---
    console.log('Login failed: Password mismatch');
    console.log('Password provided:', password);
    console.log('Password hash in DB:', user.passwordHash);
    // --- END DEBUGGING ---
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // User is valid! Create a JWT
  console.log('Login success: Password matched!');
  const payload = { id: user.id, username: user.username };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

  res.json({ message: 'Login successful!', token: token });
});

/**
 * @route   GET /api/protected
 * @desc    A protected route that requires a valid JWT
 */
app.get('/api/protected', verifyToken, (req, res) => {
  // If we get here, verifyToken() was successful
  res.json({ 
    message: 'Success! You have accessed protected data.',
    user: req.user // req.user was set by the middleware
  });
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});