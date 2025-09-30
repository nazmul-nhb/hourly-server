// @ts-check

import { cpSync } from 'fs';
import {
	defineScriptConfig,
	expressMongooseZodTemplate,
	updateCollection,
	updateRoutes,
} from 'nhb-scripts';
import { Stylog } from 'nhb-toolbox/stylog';

export default defineScriptConfig({
	format: {
		args: ['--write'],
		files: ['src', 'nhb.scripts.config.mjs'],
		ignorePath: '.prettierignore',
	},
	lint: { folders: ['src'], patterns: ['**/*.ts'] },
	fix: { folders: ['src'], patterns: ['**/*.ts'] },
	commit: {
		runFormatter: true,
		wrapPrefixWith: '`',
		emojiBeforePrefix: true,
	},
	build: {
		distFolder: 'dist',
		commands: [{ cmd: 'tsc' }, { cmd: 'tsc-alias' }],
		after: [copyFolder],
	},
	count: {
		defaultPath: 'src',
		excludePaths: ['node_modules', 'dist'],
	},
	module: {
		force: false,
		destination: 'src/app/modules',
		defaultTemplate: 'express-mongoose-zod',
		templates: {
			'express-mongoose-zod': {
				createFolder: true,
				destination: 'src/app/modules',
				files: (moduleName) => expressMongooseZodTemplate(moduleName, true),
				onComplete: (moduleName) => {
					updateCollection(moduleName);
					updateRoutes(moduleName, true);
				},
			},
		},
	},
});

/**
 *  * Copies the contents of one folder to another.
 *
 * @param {string} srcDir Path of the source folder. Defaults to `src/public`
 * @param {string} destDir Path of the destination folder. Defaults to `dist/public`
 */
function copyFolder(srcDir = 'src/public', destDir = 'dist/public') {
	const ansiColor = Stylog.ansi16;
	const bgGray = Stylog.ansi16('bgBlackBright').toANSI;

	try {
		cpSync(srcDir, destDir, { recursive: true });
		console.info(
			ansiColor('blackBright').toANSI('│\n') +
				ansiColor('greenBright').toANSI(
					`◇  ✅ Contents from ${bgGray(` ${srcDir} `)} copied to ${bgGray(` ${destDir} `)} successfully!`
				)
		);
	} catch (err) {
		console.error(ansiColor('redBright').toANSI(`🛑 Error copying folder: ${err}`));
	}
}
