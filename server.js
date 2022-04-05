require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const authRouter = require('./routes/auth');
const roomRouter = require('./routes/room');

const connectDB = async () => {
    try {
        await mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@iot.qq3sv.mongodb.net/iot?retryWrites=true&w=majority`,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('MongDB connected');
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
}

connectDB();
app.use(express.json());
app.use(cors());

app.use('/api/auth', authRouter);
app.use('/api/room', roomRouter);

app.listen(5000, () => {
    console.log('Server listen on port 5000');
})