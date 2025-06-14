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


const allowedOrigins = [
    'http://localhost:5173',
    'https://petcare-frontend-wine.vercel.app',
    'https://petcare-frontend-aswins-projects-4a7f2fc4.vercel.app/',
    'https://petcare-frontend-git-main-aswins-projects-4a7f2fc4.vercel.app/'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) return callback(null, true); // Allow non-browser tools like Postman
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
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