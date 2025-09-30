import type { IDuplicateError, IErrorResponse, IErrorSource } from '@/types/interfaces';
import type { Error as MongoError } from 'mongoose';
import { capitalizeString, pluralizer } from 'nhb-toolbox';

interface DuplicateInfo {
	db: string | null;
	collection: string | null;
	fields: Record<string, string>;
}

/**
 * * Extracts database, collection, and duplicate key fields from MongoDB duplicate key error message.
 *
 * @param message - The MongoDB duplicate key error message.
 * @returns An object with db, collection, and parsed duplicate fields
 */
const extractMongoDuplicateInfo = (message: string | undefined): DuplicateInfo => {
	if (typeof message !== 'string') {
		return { db: null, collection: null, fields: {} };
	}

	const collectionMatch = message.match(/collection:\s*([^.]+)\.([^\s]+)/);
	const dupKeyMatch = message.match(/dup key:\s*\{(.+)\}/);

	const fields: Record<string, string> = {};

	if (dupKeyMatch?.[1]) {
		const pairRegex =
			/["']?([^"':\s]+(?:\.[^"':\s]+)*)["']?\s*:\s*(ObjectId\(["']?[a-f\d]{24}["']?\)|"[^"]+"|'[^']+'|[^,}]+)/g;

		let match: RegExpExecArray | null;
		while ((match = pairRegex.exec(dupKeyMatch[1])) !== null) {
			const key = match[1];
			let value = match[2].trim();

			// Parse ObjectId or strip quotes
			const objectIdMatch = value.match(/ObjectId\(["']?([a-f\d]{24})["']?\)/i);
			if (objectIdMatch) {
				value = objectIdMatch[1];
			} else {
				value = value.replace(/^['"]|['"]$/g, '');
			}

			fields[key] = value;
		}
	}

	return {
		db: collectionMatch?.[1] ?? null,
		collection: collectionMatch?.[2] ?? null,
		fields,
	};
};

/** * Processes Mongoose Validation Errors and returns a structured response. */
export const handleValidationError = (
	error: MongoError.ValidationError,
	stack?: string
): IErrorResponse => {
	const errorSource: IErrorSource[] = Object.values(error.errors).map(
		(err: MongoError.ValidatorError | MongoError.CastError) => ({
			path: err.path,
			message: err.message,
		})
	);

	return {
		statusCode: 400,
		name: 'Validation Error',
		errorSource,
		stack,
	};
};

/** * Processes Mongoose Cast Errors and returns a structured response. */
export const handleCastError = (
	error: MongoError.CastError,
	stack?: string
): IErrorResponse => {
	return {
		statusCode: 400,
		name: `Invalid ObjectId!`,
		errorSource: [
			{
				path: error.path,
				message: `Invalid ObjectId “${error.value}”!`,
			},
		],
		stack,
	};
};

/** * Processes Mongo Duplicate Errors and returns a structured response. */
export const handleDuplicateError = (error: IDuplicateError, stack?: string) => {
	const key = error?.keyValue ? Object.keys(error.keyValue)[0] : undefined;

	const { collection, fields } = extractMongoDuplicateInfo(
		error?.errorResponse?.errmsg ?? error?.errorResponse?.message
	);

	// Prefer "date", fallback to first available key
	const field = fields.date ? 'date' : (Object.keys(fields)[0] ?? key ?? 'unknown');
	const value = fields[field] ?? error?.keyValue?.[field] ?? 'duplicate';

	const docName =
		collection ? pluralizer.toSingular(capitalizeString(collection?.trim())) : 'Document';

	return {
		statusCode: 409,
		name: 'Duplicate Error',
		errorSource: [
			{
				path: field,
				message: `${docName} already exists with ${field}: ${value}`,
			},
		],
		stack,
	};
};

export const mongoErrors = {
	handleValidationError,
	handleCastError,
	handleDuplicateError,
};
