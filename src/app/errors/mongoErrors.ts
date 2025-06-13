import type { Error as MongoError } from 'mongoose';
import type {
	IDuplicateError,
	IErrorResponse,
	IErrorSource,
} from '../types/interfaces';
import { capitalizeString } from 'nhb-toolbox';

/**
 * * Extracts the db & collection name from a MongoDB duplicate key error message.
 * @param error - The MongoDB error object.
 * @returns The `db` & `collection` names as string (or null if not found) in an object.
 */
export function extractCollectionName(error: IDuplicateError): {
	db: string | null;
	collection: string | null;
} {
	const errmsg = error?.errorResponse?.errmsg;

	if (typeof errmsg === 'string') {
		const match = errmsg.match(/collection:\s([^.]+)\.([^\s]+)/);
		if (match) {
			// match[1] = DB name, match[2] = collection name
			return { db: match[1], collection: match[2] };
		}
	}

	return { db: null, collection: null };
}

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
	const key = Object.keys(error.keyValue)[0];
	const { collection } = extractCollectionName(error);
	const docName =
		collection ?
			capitalizeString(collection).replace(/s(?=[^s]*$)/, '')
		:	'Document';

	return {
		statusCode: 409,
		name: 'MongoDB Duplicate Error',
		errorSource: [
			{
				path: key,
				message: `${docName} exists with ${key}: ${error.keyValue[key]}`,
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
