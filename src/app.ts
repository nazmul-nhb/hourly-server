import cookieParser from 'cookie-parser';
import cors from 'cors';
import type { Application, Request, Response } from 'express';
import express from 'express';
import { corsOptions } from './app/configs/cors';
import {
	catchAllErrors,
	handleRouteNotFound,
} from './app/middlewares/errorHandlers';
import router from './app/routes';
import sendResponse from './app/utilities/sendResponse';

// * Create an Express App
const app: Application = express();

// * Respect CORS Policy
app.use(cors(corsOptions));

// * Use Cookie Parser
app.use(cookieParser());
// * Use JSON Parser
app.use(express.json());

// * Root/Test Route
app.get(['/', '/api'], (_req: Request, res: Response) => {
	sendResponse(res, 'N/A', 'OK', null, 'Hourly Server is Running! 🏃');
});

// * Application Routes
app.use('/api', router);

// * Error handler for 404 or invalid request
app.use(handleRouteNotFound);

// * Global error handler to catch and send error responses
app.use(catchAllErrors);

export default app;
