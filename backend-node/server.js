require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const { logger } = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');
const cookieParser = require('cookie-parser');
const credentials = require('./middleware/credentials');
const verifyJWT = require('./middleware/verifyJWT');

const PORT = process.env.PORT || 3500;


// const crypto = require('crypto');
// function generateToken(length = 64) {
//   return crypto.randomBytes(length).toString('hex');
// }
// console.log(generateToken());

app.use(logger);
app.use(credentials);
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use('/', express.static(path.join(__dirname, '..', 'frontend', '/dist')));

app.use(require('./routes/root'))
app.use('/api/auth', require('./routes/auth'));

app.use(verifyJWT)

app.use('/api', require('./routes/forum'));

app.use(errorHandler)

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
