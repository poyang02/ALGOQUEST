const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

// 1. Use the Port Render assigns, or 5000 if local
const port = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "a_super_secret_key_that_should_be_in_an_env_file";

// 2. Configure Database Connection (Smart Switch)
// If we have a DATABASE_URL env var, we are on Render.
const isProduction = process.env.NODE_ENV === 'production' || process.env.DATABASE_URL;

const pool = new Pool(
  isProduction
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false, // Required for Render's secure connection
        },
      }
    : {
        user: 'postgres',
        host: 'localhost',
        database: 'algoquest',
        // 🚨 REMINDER: Make sure to use your actual password here for local testing!
        password: '61212611414142002', 
        port: 5432,
      }
);

app.use(cors());
app.use(express.json());

// --- Authentication Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- Auth Endpoints ---
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
      [name, email, hashedPassword]
    );
    res.json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (user.rows.length === 0) return res.status(401).json("Invalid credential");
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) return res.status(401).json("Invalid credential");

    const token = jwt.sign({ id: user.rows[0].id }, JWT_SECRET);
    res.json({ status: 'ok', token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// --- User Data Endpoint ---
app.get('/api/user/me', authenticateToken, async (req, res) => {
  try {
    const user = await pool.query("SELECT id, name, email FROM users WHERE id = $1", [
      req.user.id,
    ]);
    if (user.rows.length === 0) {
      return res.status(404).json("User not found");
    }
    res.json(user.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// --- Mission Progress Endpoints ---
app.get('/api/progress', authenticateToken, async (req, res) => {
  try {
    const progress = await pool.query(
      "SELECT mission_id, score FROM mission_progress WHERE user_id = $1",
      [req.user.id]
    );
    res.json(progress.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

app.post('/api/progress', authenticateToken, async (req, res) => {
  const { missionId, score } = req.body;
  const userId = req.user.id;
  try {
    const newProgress = await pool.query(
      `INSERT INTO mission_progress (user_id, mission_id, score) 
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, mission_id) 
       DO UPDATE SET score = $3
       RETURNING *`,
      [userId, missionId, score]
    );
    res.json(newProgress.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// 3. Update the listen command to use the dynamic port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});