import express from 'express';
import dotenv from 'dotenv';
import { AppDataSource } from './config/dataSource';
import userRouter from './routes/userRoute';
import { errorHandler } from './middlewares/errorHandler';
import { notFoundHandler } from './middlewares/notFoundHandler';

dotenv.config();
const PORT = process.env.PORT || 3000;
const VERSION = process.env.VERSION;
const app = express();

app.use(express.json());
app.use(`${VERSION}/users`, userRouter);

app.get(`${VERSION}/health`, (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use(notFoundHandler);

app.use(errorHandler);

AppDataSource.initialize()
  .then(() => {
    console.log('Database connected');
    app.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
    });
  })
  .catch((err) => console.log(err));
