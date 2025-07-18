// @ts-check

import { defineScriptConfig } from 'nhb-scripts';

export default defineScriptConfig({
    format: {
        args: ['--write'],
        files: ['src'],
        ignorePath: '.prettierignore',
    },
    lint: { folders: ['src'], patterns: ['**/*.ts'] },
    fix: { folders: ['src'], patterns: ['**/*.ts'] },
    commit: {
        runFormatter: true,
    },
    build: {
        distFolder: 'dist',
        commands: [{ cmd: 'tsc', }],
    },
    count: {
        defaultPath: 'src',
        excludePaths: ['node_modules', 'dist', 'build']
    },
    module: {
        destination: 'src/app/modules',
        template: 'express-mongoose-zod',
        force: false,
    }
});
