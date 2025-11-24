import express from 'express';
import { AppDataSource } from './config/dataSource';
import userRouter from './routes/userRoute';
import { errorHandler } from './middlewares/errorHandler';
import { routeNotFoundHandler } from './middlewares/routeNotFoundHandler';
import { ResponseFormatter } from './utils/apiResponse';
import { envValues } from './utils/envParser';
import storyRouter from './routes/storyRoute';
import { envValues } from './utils/envParser';

const PORT = envValues.PORT || 3000;
const VERSION = envValues.VERSION;
const app = express();

app.use(express.json());
app.use(`${VERSION}/users`, userRouter);
app.use(`${VERSION}/stories`, storyRouter);

app.get(`${VERSION}/health`, (req, res) => {
<<<<<<< HEAD
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
  res
    .status(200)
    .json(ResponseFormatter.success(healthData, 'Server is healthy'));
});

app.use(routeNotFoundHandler);
=======
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use(notFoundHandler);
>>>>>>> 3c84286 (feat: create global errorHandler and implement custom error classes)

app.use(errorHandler);

AppDataSource.initialize()
  .then(() => {
    console.log('Database connected');
    app.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
    });
  })
  .catch((err) => console.log(err));
