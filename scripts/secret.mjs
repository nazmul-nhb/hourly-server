// @ts-check

import { randomBytes } from 'crypto';
import clipboard from 'clipboardy';
import chalk from 'chalk';

try {
	const secret = randomBytes(64).toString('hex');

	await clipboard.write(secret);
	console.info(
		chalk.cyanBright(
			`🔑 Secret Copied to Clipboard:\n ${chalk.bgCyan.bold(secret)}`,
		),
	);
} catch (error) {
	console.error(
		chalk.redBright('🛑 Failed to Copy Secret to Clipboard:'),
		error,
	);
}
