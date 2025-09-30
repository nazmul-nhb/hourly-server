import type { IDuplicateError, IParserError } from '@/types/interfaces';
import { MongooseError, type CastError } from 'mongoose';
import { isObject } from 'nhb-toolbox';
import type { StrictObject } from 'nhb-toolbox/object/types';

/**
 * * Type guard to check if an error is a MongoDB Duplicate Error.
 * @param error - An unknown error object.
 */
export const isMongoDuplicateError = (error: unknown): error is IDuplicateError => {
	return isObject(error) && 'code' in error && error.code === 11000;
};

/**
 * * Type guard to check if an error is a Mongoose CastError.
 *
 * @param error An unknown error object.
 */
export const isCastError = (error: unknown): error is CastError => {
	// Check for direct CastError
	if (isObject(error) && 'name' in error && error.name === 'CastError') {
		return true;
	}

	// Check if the error is a ValidationError containing CastError(s)
	if (isObject(error) && 'errors' in error && error instanceof MongooseError) {
		const errors = error.errors as StrictObject;
		return Object.values(errors).some(
			(nestedError) =>
				isObject(nestedError) &&
				'name' in nestedError &&
				nestedError.name === 'CastError'
		);
	}

	return false;
};

/**
 * * Type guard to check if an error is an Express Body Parser Error.
 * @param error An unknown error object.
 */
export const isParserError = (error: unknown): error is IParserError => {
	return isObject(error) && 'type' in error && error.type === 'entity.parse.failed';
};

export const typeGuards = { isCastError, isMongoDuplicateError, isParserError };
