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
	field: string | null;
	value: string | null;
}

/**
 * * Extracts database, collection, and duplicate key info from MongoDB duplicate key error message.
 *
 * @param message - The MongoDB duplicate key error message.
 * @returns An object with db, collection, field, and value
 */
const extractMongoDuplicateInfo = (
	message: string | undefined,
): DuplicateInfo => {
	if (typeof message !== 'string') {
		return { db: null, collection: null, field: null, value: null };
	}

	const collectionMatch = message.match(/collection:\s([^.]+)\.([^\s]+)/);
	const dupKeyMatch = message.match(
		/dup key:\s*\{\s*"?([^"'\s]+)"?\s*:\s*"(.+?)"\s*\}/,
	);

	return {
		db: collectionMatch?.[1] ?? null,
		collection: collectionMatch?.[2] ?? null,
		field: dupKeyMatch?.[1] ?? null,
		value: dupKeyMatch?.[2] ?? null,
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

	const { collection, field, value } = extractMongoDuplicateInfo(
		error?.errorResponse?.errmsg ?? error?.errorResponse?.message,
	);
	const docName =
		collection ?
			capitalizeString(collection).replace(/s(?=[^s]*$)/, '')
		:	'Document';

	return {
		statusCode: 409,
		name: 'MongoDB Duplicate Error',
		errorSource: [
			{
				path: key ?? field ?? 'unknown',
				message: `${docName} exists with ${key ?? field ?? 'unknown'}: ${key ? error?.keyValue?.[key] : (value ?? 'duplicate')}`,
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
