const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const PORT = 4000;

// --- Middleware ---
app.use(cors({ origin: 'http://localhost:5173' })); 
app.use(express.json());

// --- "Database" with Roles ---
const users = [
  {
    id: 1,
    username: 'admin',
    // Password: "admin123"
    passwordHash: '$2a$10$iJaR3lSG17VEIeBpLrmHWe7DPPFzngOPuraN1cF6Nm/DJgqWqT0me', 
    role: 'Admin'
  },
  {
    id: 2,
    username: 'mod',
    // Password: "mod123"
    passwordHash: '$2a$10$XYe0TdwWpE14xgLaP7/73e/DuG6acnN8L/U3MqXHgRyz4USGz2SMO', 
    role: 'Moderator'
  },
  {
    id: 3,
    username: 'user',
    // Password: "user123"
    passwordHash: '$2a$10$TbJrOeb1JVLFC1Vb1C.5UuYRr1O2FLybykk4SWB1URqMGV05dhO/e', 
    role: 'User'
  }
];

const JWT_SECRET = 'your-super-secret-key-that-is-very-long-and-secure';

// --- Authentication Middleware (Checks Token) ---
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 

  if (token == null) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, userPayload) => {
    if (err) {
      return res.status(403).json({ message: 'Token is invalid' });
    }
    req.user = userPayload; // req.user now contains { id, username, role }
    next();
  });
}

// --- Authorization Middleware (Checks Role) ---
function authorizeRoles(allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Error: User role not found' });
    }

    const userRole = req.user.role;

    if (allowedRoles.includes(userRole)) {
      next(); // Role is allowed
    } else {
      return res.status(403).json({ message: 'Forbidden: You do not have permission' });
    }
  };
}

// --- Routes ---
/**
 * @route   POST /login
 */
app.post('/login', async (req, res) => {
  // --- START DEBUGGING ---
  console.log('--- Login Attempt ---');
  console.log('Received body:', req.body);
  // --- END DEBUGGING ---

  const { username } = req.body;
  const password = req.body.password ? req.body.password.trim() : '';

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

  // User is valid!
  console.log('Login success: Password matched!');
  const payload = { 
    id: user.id, 
    username: user.username, 
    role: user.role
  };
  
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  res.json({ message: 'Login successful!', token: token });
});

/**
 * @route   GET /api/profile
 * @access  Admin, Moderator, User
 */
app.get(
  '/api/profile', 
  verifyToken, 
  authorizeRoles(['Admin', 'Moderator', 'User']), // <-- Check for typos here
  (req, res) => {
    res.json({ message: 'Welcome to your User Profile!', user: req.user });
  }
);

/**
 * @route   GET /api/moderator
 * @access  Admin, Moderator
 */
app.get(
  '/api/moderator',
  verifyToken,
  authorizeRoles(['Admin', 'Moderator']), // <-- And check for typos here
  (req, res) => {
    res.json({ message: 'Welcome to the Moderator Panel!', user: req.user });
  }
);

/**
 * @route   GET /api/admin
 * @access  Admin Only
 */
app.get(
  '/api/admin',
  verifyToken,
  authorizeRoles(['Admin']), // <-- The typo is almost certainly here
  (req, res) => {
    res.json({ message: 'Welcome to the Admin Dashboard!', user: req.user });
  }
);
// --- Start Server ---
app.listen(PORT, () => {
  console.log(`🚀 Role-based backend server running on http://localhost:${PORT}`);
});