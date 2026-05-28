import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/dbconnect.js';
import authRoutes from './routes/authRoutes.js';
import rankRouter from './routes/rankRoutes.js';
import analysisRouter from './routes/analysisroutes.js';


dotenv.config();
connectDB();
const app = express();
app.use(express.json());
app.use(cors());

app.get('/',(req,res)=>{res.send('Hello World')});
app.use('/api/auth', authRoutes);
app.use('/api/rank',rankRouter)
app.use('/api/analysis',analysisRouter)

const port = 5000 ;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});