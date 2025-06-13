import { isValidObjectId, type Types } from 'mongoose';
import { ErrorWithStatus } from '../classes/ErrorWithStatus';
import { STATUS_CODES } from '../constants';
import type { TCollection } from '../types';

/**
 * * Utility to check MongoDB `ObjectId`
 * @param id `ID` to validate/check.
 * @param collection Collection name to generate relevant error message.
 * @param path Path where the error occurred.
 */
export const validateObjectId = (
	id: Types.ObjectId | string,
	collection: Lowercase<TCollection>,
	path: string,
) => {
	if (!isValidObjectId(id)) {
		throw new ErrorWithStatus(
			'Validation Error',
			`Invalid ${collection} ID: ${id}`,
			STATUS_CODES.BAD_REQUEST,
			path,
		);
	}
};
