import type { RequestHandler } from 'express';
import { chronos } from 'nhb-toolbox';
import configs from '../configs';
import chalk from 'chalk';

/** * Logs incoming HTTP requests in a structured and readable format. */
export const requestLogger: RequestHandler = (req, res, next): void => {
	const now = chronos();
	const time =
		configs.NODE_ENV === 'development' ?
			now.toLocalISOString()
		:	now.toISOString();

	const method = req.method;
	const url = req.originalUrl;
	const ip = req.ip ?? 'unknown';

	const start = process.hrtime.bigint();

	res.on('finish', () => {
		const end = process.hrtime.bigint();
		const durationMs = Number(end - start) / 1_000_000;

		const durationColor =
			durationMs > 1000 ? chalk.red
			: durationMs > 500 ? chalk.yellow
			: chalk.green;

		const statusColor =
			res.statusCode >= 500 ? chalk.bgYellow
			: res.statusCode >= 400 ? chalk.bgRed
			: res.statusCode >= 300 ? chalk.bgCyan
			: chalk.bgGreen;

		console.info(
			`[${chalk.yellow(time)}] ${chalk.cyan.bold(method)} ${chalk.cyan(url)} `.concat(
				`→ ${statusColor.bold(res.statusCode ?? 500)} - IP: ${chalk.gray(ip)} → ${durationColor(durationMs.toFixed(2) + 'ms')}`,
			),
		);
	});

	next();
};
