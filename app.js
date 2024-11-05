// Package imports
const express = require('express');
require('dotenv').config();
const cookieParser = require('cookie-parser');

// local imports
const connectDb = require('./db/dbconnect');
const authRouter = require('./routes/authRouter');
const roomRouter = require('./routes/roomRouter');
const { authenticateUser } = require('./middlewares/authorize');

// Globals
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(express.static('./public'));
app.use(express.json())
app.use(cookieParser());

// Routes

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/auth/test', authenticateUser, (req, res) => res.status(200).json({
    success: true,
    loggedIn: true
}));
app.use('/api/v1/rooms',  authenticateUser ,roomRouter);

// start the server


const start =  async () => {
    try {
        await connectDb(process.env.MONGO_URI);
        console.log('connected to database');
        app.listen(PORT, () => console.log(`server listening on port ${PORT}...`));
        } catch (error) {
            console.log(error);

        }
}

start();