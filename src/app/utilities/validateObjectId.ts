import { ErrorWithStatus } from '@/classes/ErrorWithStatus';
import type { TCollection } from '@/types';
import { isValidObjectId, type Types } from 'mongoose';
import { STATUS_CODES } from 'nhb-toolbox/constants';

/**
 * * Utility to check MongoDB `ObjectId`
 * @param id `ID` to validate/check.
 * @param collection Collection name to generate relevant error message.
 * @param path Path where the error occurred.
 */
export const validateObjectId = (
	id: Types.ObjectId | string,
	collection: Lowercase<Exclude<TCollection, 'N/A'>>,
	path: string
) => {
	if (!isValidObjectId(id)) {
		throw new ErrorWithStatus(
			'Validation Error',
			`Invalid ${collection} ID: ${id}`,
			STATUS_CODES.BAD_REQUEST,
			path
		);
	}
};
