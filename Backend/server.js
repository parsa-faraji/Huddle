const express = require('express');
const cors = require('cors');
const verifyToken = require('./middleware/verifyToken');

const app = express();
app.use(cors());
app.use(express.json());

// A protected route
app.get('/profile', verifyToken, (req, res) => {
  res.json({ message: `Hello user ${req.user.uid}` });
});

// Another public route just to test
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
