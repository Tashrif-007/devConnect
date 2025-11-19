import express from 'express';
import dotenv from 'dotenv';
import { AppDataSource } from './config/dataSource';

dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();

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
