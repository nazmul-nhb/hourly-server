import type { RequestHandler } from 'express';

/** * Middleware to parse `FormData` and attach the parsed object to `req.body`. */
export const parseFormData: RequestHandler = (req, _res, next) => {
	try {
		if (req.body.data) {
			req.body = JSON.parse(req.body.data);
		}

		next();
	} catch (error) {
		next(error);
	}
};
