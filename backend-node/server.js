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

const PORT = process.env.PORT || 3000;


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
app.use('/', require('./routes/auth'));

app.listen(PORT, console.log(`Server running at http://localhost:${PORT}`));
