const jwt = require('jsonwebtoken');
require('dotenv').config();

function verifyJWT(req, res, next) {
  const token = req.cookies?.jwt;
  if(!token) return res.status(401).json({ message: 'No token provided'})
    
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: err });
    req.userId = decoded.id || decoded.userId;
    next();
  });
}

module.exports = verifyJWT;
