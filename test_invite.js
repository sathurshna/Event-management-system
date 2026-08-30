const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'backend/.env' });

const payload = { userId: '734a50b2-4687-46e4-a5f1-4c774808602b', email: 'ss@gmail.com' };
const token = jwt.sign(payload, process.env.JWT_ACCESS_SECRET);
console.log(token);
