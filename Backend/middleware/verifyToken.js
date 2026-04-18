const { admin } = require('../firebase');

/**
 * Express middleware that verifies a Firebase ID token from the
 * Authorization header. On success, attaches the decoded token to
 * `req.user` so downstream handlers can access `req.user.uid`.
 */
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  const token = authHeader.split('Bearer ')[1];

  if (!token || token.length === 0) {
    return res.status(401).json({ error: 'Token is empty' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (err) {
    console.error('[verifyToken] Token verification failed:', err.code || err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = verifyToken;
