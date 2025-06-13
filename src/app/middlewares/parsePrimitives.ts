import type { RequestHandler } from 'express';

/** * Middleware to parse `primitive data` and attach the parsed object to `req.body`. */
export const parsePrimitives: RequestHandler = (req, _res, next) => {
	try {
		const parsedBody: Record<string, unknown> = {};

		if (req.body) {
			Object.entries(req.body).forEach(([key, value]) => {
				if (typeof value !== 'string') {
					parsedBody[key] = value;
					return;
				}

				try {
					const parsedValue = JSON.parse(value);
					parsedBody[key] = parsedValue;
				} catch {
					if (value === 'true') {
						parsedBody[key] = true;
					} else if (value === 'false') {
						parsedBody[key] = false;
					} else if (!isNaN(Number(value))) {
						parsedBody[key] = Number(value);
					} else {
						parsedBody[key] = value;
					}
				}
			});
		}

		req.body = parsedBody;

		next();
	} catch (error) {
		next(error);
	}
};
