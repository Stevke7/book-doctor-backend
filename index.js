const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require("./routes/userRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to DB'))
    .catch(err => {
        console.log(err)
        process.exit(1);
    });

mongoose.connection.on('error', err => {console.error('MongoDB connection error:', err)});
mongoose.connection.on('disconnected', () => {console.log('MongoDB disconnected');});
mongoose.connection.on('SIGINT', async () => {
    await mongoose.connection.close();
    process.exit(0);
    console.log('MongoDB connection closed')
});
app.get('/', (req, res) => {
    res.send('Backend works');
})

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
})