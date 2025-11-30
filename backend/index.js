const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

// Render uses dynamic PORT
const PORT = process.env.PORT || 5000;

// Use Render DATABASE_URL when deployed
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://postgres:61212611414142002@localhost:5432/algoquest",
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

const JWT_SECRET = process.env.JWT_SECRET || "a_super_secret_key_that_should_be_in_an_env_file";

// ✅ CORS — ALLOW NETLIFY FRONTEND
app.use(
  cors({
    origin: [
      "https://amazing-croissant-9f256c.netlify.app", // your Netlify site
      "http://localhost:5173" // for local dev
    ],
    credentials: true
  })
);

app.use(express.json());

// ---------------- AUTH MIDDLEWARE ----------------
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access denied" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
};

// ---------------- REGISTER ----------------
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, hashed]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------------- LOGIN ----------------
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0)
      return res.status(401).json({ error: "Invalid credentials" });

    const user = userResult.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch)
      return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id }, JWT_SECRET);

    res.json({ status: "ok", token });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------------- GET ME ----------------
app.get("/api/user/me", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "User not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("GET USER ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------------- GET PROGRESS ----------------
app.get("/api/progress", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT mission_id, score FROM mission_progress WHERE user_id = $1",
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET PROGRESS ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------------- SAVE PROGRESS ----------------
app.post("/api/progress", authenticateToken, async (req, res) => {
  try {
    const { missionId, score } = req.body;

    const result = await pool.query(
      `INSERT INTO mission_progress (user_id, mission_id, score)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, mission_id)
       DO UPDATE SET score = EXCLUDED.score
       RETURNING *`,
      [req.user.id, missionId, score]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("SAVE PROGRESS ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => console.log("Server running on port", PORT));
