import type { Error as MongoError } from 'mongoose';
import { capitalizeString } from 'nhb-toolbox';
import type {
	IDuplicateError,
	IErrorResponse,
	IErrorSource,
} from '../types/interfaces';

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
const extractMongoDuplicateInfo = (
	message: string | undefined,
): DuplicateInfo => {
	if (typeof message !== 'string') {
		return { db: null, collection: null, fields: {} };
	}

	const collectionMatch = message.match(/collection:\s*([^.]+)\.([^\s]+)/);
	const dupKeyMatch = message.match(/dup key:\s*\{(.+)\}/);

	const fields: Record<string, string> = {};

	if (dupKeyMatch?.[1]) {
		const pairs = dupKeyMatch[1].split(/,(?![^(]*\))/); // split on comma but ignore commas inside ObjectId(...)
		for (const pair of pairs) {
			const [rawKey, rawVal] = pair.split(/:\s*/);
			if (!rawKey || !rawVal) continue;

			const key = rawKey.replace(/^["'{\s]+|["'\s]+$/g, '');
			let val = rawVal.trim();

			const objectIdMatch = val.match(
				/ObjectId\(["']?([a-f\d]{24})["']?\)/i,
			);
			if (objectIdMatch) {
				val = objectIdMatch[1];
			} else {
				val = val.replace(/^["']|["']$/g, '');
			}

			fields[key] = val;
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
	stack?: string,
): IErrorResponse => {
	const errorSource: IErrorSource[] = Object.values(error.errors).map(
		(err: MongoError.ValidatorError | MongoError.CastError) => ({
			path: err.path,
			message: err.message,
		}),
	);

	return {
		statusCode: 400,
		name: 'Mongo Validation Error',
		errorSource,
		stack,
	};
};

/** * Processes Mongoose Cast Errors and returns a structured response. */
export const handleCastError = (
	error: MongoError.CastError,
	stack?: string,
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
export const handleDuplicateError = (
	error: IDuplicateError,
	stack?: string,
) => {
	const key = error?.keyValue ? Object.keys(error.keyValue)[0] : undefined;

	const { collection, fields } = extractMongoDuplicateInfo(
		error?.errorResponse?.errmsg ?? error?.errorResponse?.message,
	);

	// Prefer "date", fallback to first available key
	const field =
		fields.date ? 'date' : (Object.keys(fields)[0] ?? key ?? 'unknown');
	const value = fields[field] ?? error?.keyValue?.[field] ?? 'duplicate';

	const docName =
		collection ?
			capitalizeString(collection).replace(/s(?=[^s]*$)/, '')
		:	'Document';

	return {
		statusCode: 409,
		name: 'MongoDB Duplicate Error',
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
