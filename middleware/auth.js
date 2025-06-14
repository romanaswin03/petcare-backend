const jwt = require('jsonwebtoken');
// const { logout } = require('../../frontend/src/utils/auth');
const {getUserFromToken} = require('../utils/userHelpers')
const JWT_SECRET = process.env.JWT_SECRET || 'a-secure-secret'; // ideally from .env

if (!JWT_SECRET){
  console.error('Missing JWT_SECRET');
  process.exit(1);
}

function auth(req, res, next) {
    if(req.method === 'OPTIONS') return next();
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.log('No Authorization header: ', req.headers);
    
    return res.status(401).json({ message: 'Missing Authorization header' });
  }
  const [scheme,token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    console.log('Malformed Authorization header:', bearer);
    
    return res.status(401).json({ message: 'Invalid token format' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // e.g. { id: "...", role: "owner" }
    console.log('JWT verified, payload', payload);    
    next();
  } catch (err) {
    console.log('JWT verify error:', err.message);    
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = auth;