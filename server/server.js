const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const jwt      = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// ── MONGODB ───────────────────────────────────────────────────────────────────
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/prep_platform";
mongoose.connect(mongoURI)
  .then(() => console.log("✅  MongoDB Connected"))
  .catch(err => console.error("❌  MongoDB Error:", err));

// ── SCHEMAS ───────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model('User', userSchema);

// strict:false keeps any extra fields in your uploaded JSON documents
const questionSchema = new mongoose.Schema({
  company:    String,
  category:   String,
  testId:     String,
  difficulty: String,
  question:   String,
  answer:     String,
  options:    mongoose.Schema.Types.Mixed,
  option_a:   String,
  option_b:   String,
  option_c:   String,
  option_d:   String,
}, { strict: false });
const Question = mongoose.model('Question', questionSchema);

const scoreSchema = new mongoose.Schema({
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  testId:         { type: String, required: true },
  company:        { type: String, required: true },
  score:          { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  timeTaken:      { type: Number, required: true },
  date:           { type: Date, default: Date.now },
});
const Score = mongoose.model('Score', scoreSchema);

// ── AUTH MIDDLEWARE ───────────────────────────────────────────────────────────
const authenticateToken = (req, res, next) => {
  const token = (req.headers['authorization'] || '').split(' ')[1];
  if (!token) return res.status(401).json({ message: "No token" });
  jwt.verify(token, process.env.JWT_SECRET || "your_secret_key", (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};

// ── AUTH ROUTES (support both /login and /api/login) ─────────────────────────
const registerHandler = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: "All fields are required" });
    if (await User.findOne({ email }))
      return res.status(400).json({ message: "Email already registered" });
    await new User({ username, email, password }).save();
    res.status(201).json({ message: "Signup successful" });
  } catch (err) {
    res.status(500).json({ message: "Register error", error: err.message });
  }
};

const loginHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.password !== password)
      return res.status(400).json({ message: "Invalid credentials" });
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "your_secret_key",
      { expiresIn: "7d" }
    );
    res.json({ token, username: user.username, email: user.email });
  } catch (err) {
    res.status(500).json({ message: "Login error", error: err.message });
  }
};

// Register both URL patterns so old frontend code works too
app.post("/signup",       registerHandler);
app.post("/api/register", registerHandler);
app.post("/login",        loginHandler);
app.post("/api/login",    loginHandler);

// ── QUESTIONS ROUTES ─────────────────────────────────────────────────────────

// GET /questions/tests?company=amazon
// Returns distinct testIds with question counts for TestsPage
app.get("/questions/tests", async (req, res) => {
  try {
    const { company } = req.query;
    const match = { testId: { $exists: true, $ne: null, $ne: "" } };
    if (company) match.company = { $regex: new RegExp(`^${company}$`, "i") };

    const results = await Question.aggregate([
      { $match: match },
      { $group: { _id: "$testId", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    res.json(results.map(r => ({ testId: r._id, count: r.count })));
  } catch (err) {
    res.status(500).json({ message: "Aggregate error", error: err.message });
  }
});

// GET /questions?category=aptitude&company=amazon&testId=Test+1
// Case-insensitive company match — fixes "amazon" not matching "Amazon" in DB
app.get("/questions", async (req, res) => {
  try {
    const { category, company, testId } = req.query;
    const query = {};
    if (category) query.category = { $regex: new RegExp(`^${category}$`, "i") };
    if (company)  query.company  = { $regex: new RegExp(`^${company}$`,  "i") };
    if (testId)   query.testId   = testId;

    const questions = await Question.find(query).lean();
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: "Fetch error", error: err.message });
  }
});

// ── SCORE & ANALYTICS ────────────────────────────────────────────────────────
app.post("/api/save-score", authenticateToken, async (req, res) => {
  try {
    const { testId, company, score, totalQuestions, timeTaken } = req.body;
    await new Score({ userId: req.user.id, testId, company, score, totalQuestions, timeTaken }).save();
    res.status(201).json({ message: "Score saved" });
  } catch (err) {
    res.status(500).json({ message: "Save error", error: err.message });
  }
});

app.get("/api/analytics", authenticateToken, async (req, res) => {
  try {
    const scores = await Score.find({ userId: req.user.id }).sort({ date: 1 });
    res.json(scores);
  } catch (err) {
    res.status(500).json({ message: "History error", error: err.message });
  }
});

// ── START ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀  Server running on http://localhost:${PORT}`));
