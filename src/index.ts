import express from 'express';
import { AppDataSource } from './config/dataSource';
import userRouter from './routes/userRoute';
import { errorHandler } from './middlewares/errorHandler';
import { routeNotFoundHandler } from './middlewares/routeNotFoundHandler';
import { ResponseFormatter } from './utils/apiResponse';
import { envValues } from './utils/envParser';
import storyRouter from './routes/storyRoute';
import authRouter from './routes/authRoute';
import adminRouter from './routes/adminRoute';
import { apiLimiter } from './middlewares/rateLimiter';

const PORT = envValues.PORT || 3000;
const VERSION = envValues.VERSION;
const app = express();

app.use(express.json());
app.use(apiLimiter);

app.use(`${VERSION}/users`, userRouter);
app.use(`${VERSION}/stories`, storyRouter);
app.use(`${VERSION}/auth`, authRouter);
app.use(`${VERSION}/admin`, adminRouter);

app.get(`${VERSION}/health`, (req, res) => {
    const healthData = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    };
    res.status(200).json(
        ResponseFormatter.success(healthData, 'Server is healthy'),
    );
});

app.use(routeNotFoundHandler);

app.use(errorHandler);

AppDataSource.initialize()
    .then(() => {
        console.log('Database connected');
        app.listen(PORT, () => {
            console.log(`Server running on ${PORT}`);
        });
    })
    .catch((err) => console.log(err));
