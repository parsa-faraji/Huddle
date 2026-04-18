const express = require('express');
const cors = require('cors');
const verifyToken = require('./middleware/verifyToken');

const app = express();
app.use(cors());
app.use(express.json());

// All routes under /api for Vercel deployment
app.get('/api', (req, res) => {
  res.send('Backend is running!');
});
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Backend is healthy!' });
});
app.get('/api/profile', verifyToken, (req, res) => {
  res.json({ message: `Hello user ${req.user.uid}` });
});

// Legacy root routes (local dev)
app.get('/', (req, res) => res.send('Backend is running!'));
app.get('/profile', verifyToken, (req, res) => {
  res.json({ message: `Hello user ${req.user.uid}` });
});

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
module.exports = app;
