import type { IErrorResponse, IErrorSource } from '@/types/interfaces';
import { joinArrayElements } from 'nhb-toolbox';
import type { ZodError } from 'zod';

/** * Processes Zod Validation Errors and returns a structured response. */
export const handleZodErrors = (error: ZodError, stack?: string): IErrorResponse => {
	const errorSource: IErrorSource[] = error.issues.map((zodIssue) => {
		const path = zodIssue.path.join('.');
		let message = zodIssue.message;

		switch (zodIssue.code) {
			case 'invalid_value':
				message = `Invalid value for “${path}”. Expected one of: “${joinArrayElements(zodIssue.values)}”!`;
				break;
		}

		return { path, message };
	});

	return {
		statusCode: 400,
		name: 'Validation Error',
		errorSource,
		stack: error.stack || stack,
	};
};
