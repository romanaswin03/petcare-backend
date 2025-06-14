const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const auth = require('./middleware/auth');
const appointmentRoutes = require('./routes/appointment.routes');
require('dotenv').config();
const connectDatabase = require('./config/database');

connectDatabase();

const authRoutes = require('./routes/auth.routes');
const app = express();

app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    exposedHeaders: ['Authorization']
}));

app.options('*catchall', (req, res) => {
    res.sendStatus(404).send(`Cannot find ${req.originalUrl}`);
});


app.use((req, res, next) => {
    console.log('Headers: ',{
        authorization: req.headers.authorization || 'none',
        origin: req.headers.origin || 'none',
        method: req.method,
        path: req.path
    });
    next();
});

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/appointments',auth, appointmentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));