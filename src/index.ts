import express from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { AppDataSource } from './config/dataSource';
import userRouter from './routes/userRoute';
import { errorHandler } from './middlewares/errorHandler';
import { routeNotFoundHandler } from './middlewares/routeNotFoundHandler';
import { ResponseFormatter } from './utils/apiResponse';
import { envValues } from './utils/envParser';
import storyRouter from './routes/storyRoute';
import authRouter from './routes/authRoute';
import adminRouter from './routes/adminRoute';
import categoryRouter from './routes/categoryRoute';
import voteRouter from './routes/voteRoute';
import commentRouter from './routes/commentRoute';
import { swaggerOptions, swaggerUIOptions } from './config/swagger';
import cors from 'cors';

const PORT = envValues.PORT || 3000;
const FRONTEND_URL = envValues.FRONTEND_URL as string;
const VERSION = envValues.VERSION;
const app = express();

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use(express.json());
app.use(
    cors({
        origin: ['http://localhost:5173', FRONTEND_URL],
    }),
);

app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec, swaggerUIOptions));

app.use(`${VERSION}/users`, userRouter);
app.use(`${VERSION}/stories`, storyRouter, voteRouter, commentRouter);
app.use(`${VERSION}/auth`, authRouter);
app.use(`${VERSION}/admin`, adminRouter);
app.use(`${VERSION}/categories`, categoryRouter);

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

app.get('/', (_req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Backend is running',
    timestamp: new Date().toISOString()
  });
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
