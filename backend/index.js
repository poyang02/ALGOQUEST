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
const isProduction = process.env.NODE_ENV === 'production' || process.env.DATABASE_URL;

const pool = new Pool(
  isProduction
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false,
        },
      }
    : {
        user: 'postgres',
        host: 'localhost',
        database: 'algoquest_db',
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

// --- Auth Routes ---
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

// --- Get User Info ---
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

// --- PROGRESS API FOR HUB ---
app.get('/api/progress', authenticateToken, async (req, res) => {
  try {
    // 1. Total score grouping
    const scoresQuery = await pool.query(
      `SELECT mission, SUM(score) as total_score 
       FROM mission_scores 
       WHERE user_id = $1 
       GROUP BY mission`,
      [req.user.id]
    );

    // 2. Pull badges per mission
    const badgeQuery = await pool.query(
      `SELECT mission, badge FROM user_badges WHERE user_id = $1`,
      [req.user.id]
    );

    // Group badges by mission
    const missionBadges = {};
    badgeQuery.rows.forEach(row => {
      const missionKey = `mission${row.mission}`;
      if (!missionBadges[missionKey]) missionBadges[missionKey] = [];
      missionBadges[missionKey].push(row.badge);
    });

    // 3. Build formatted response
    const formattedData = scoresQuery.rows.map(row => {
      const missionKey = `mission${row.mission}`;
      return {
        mission_id: missionKey,
        score: parseInt(row.total_score),
        badges: missionBadges[missionKey] || []
      };
    });

    res.json(formattedData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// --- MISSION SUBMISSION LOGIC ---
// --- NEW: Submit Attempt (Trust Frontend Logic) ---
app.post("/api/mission/submit", authenticateToken, async (req, res) => {
  try {
    const { mission, phase, isCorrect, score, badge } = req.body;
    const userId = req.user.id;

    // 1. Log the attempt (for history)
    const attemptCountResult = await pool.query(
      `SELECT COUNT(*) AS count FROM mission_attempts WHERE user_id=$1 AND mission=$2 AND phase=$3`,
      [userId, mission, phase]
    );
    const attemptNumber = Number(attemptCountResult.rows[0].count) + 1;

    // Use score from frontend or default to 0
    const finalScore = score !== undefined ? score : 0;

    await pool.query(
      `INSERT INTO mission_attempts 
        (user_id, mission, phase, attempt_number, correct, score)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, mission, phase, attemptNumber, isCorrect, finalScore]
    );

    // 2. Update Best Score (Keep Highest)
    if (isCorrect) {
        await pool.query(
        `INSERT INTO mission_scores (user_id, mission, phase, score)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id, mission, phase)
        DO UPDATE SET score = GREATEST(mission_scores.score, EXCLUDED.score),
                      updated_at = now()`,
        [userId, mission, phase, finalScore]
        );
    }

    // 3. Award Badge (TRUST THE FRONTEND)
    // If the frontend sends a badge string (e.g., "Master Algoritma"), save it.
    // We append the mission ID to make it unique per mission if needed, 
    // or just save it as is if your frontend handles unique names.
    if (badge) {
        // Optional: You can prefix it if you want easier filtering later, e.g. `${mission}-${badge}`
        // For now, we save exactly what the frontend sends.
        await pool.query(
          `INSERT INTO user_badges (user_id, mission, badge)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id, badge) DO NOTHING`,
          [userId, mission, badge]
        );
    }

    res.json({ status: "ok", message: "Saved", attemptNumber });

  } catch (err) {
    console.error("MISSION SUBMIT ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
