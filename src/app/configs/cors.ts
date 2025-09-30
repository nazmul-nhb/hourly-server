import { type CorsOptions } from 'cors';

export const corsOptions: CorsOptions = {
	origin: (origin, callback) => {
		const allowedOrigins = [
			/^http:\/\/localhost:\d+$/,
			/^http:\/\/192\.168\.0\.\d+:\d+$/,
			'https://nexabyte-hourly.web.app',
		];

		if (
			!origin ||
			allowedOrigins.some((pattern) =>
				typeof pattern === 'string' ? pattern === origin : pattern.test(origin)
			)
		) {
			callback(null, true);
		} else {
			callback(new Error('Not allowed by CORS'));
		}
	},
	// origin: '*',
	credentials: true,
};
