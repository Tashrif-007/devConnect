import express from 'express';
import dotenv from 'dotenv';
import { AppDataSource } from './config/dataSource';
import userRouter from './routes/userRoute';

dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use('/api/users', userRouter);

app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    })
})

AppDataSource.initialize().then(() => {
    console.log('Database connected');
    app.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
    });
  }).catch((err) => console.log(err));
