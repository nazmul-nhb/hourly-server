import { Schema, model } from 'mongoose';
import type { IShiftDoc, IShiftModel } from './shift.types';
import { ErrorWithStatus } from '../../classes/ErrorWithStatus';
import { STATUS_CODES } from '../../constants';

const shiftSchema = new Schema<IShiftDoc>(
	{
		user: {
			type: Schema.ObjectId,
			ref: 'User',
			required: [true, 'User is required!'],
		},
		start_time: {
			type: String,
			required: true,
		},
		end_time: {
			type: String,
			required: true,
		},
		break_hours: {
			type: String,
			required: false,
		},
		working_hours: {
			type: String,
			required: false,
		},
		working_mins: {
			type: Number,
			required: false,
		},
		break_mins: {
			type: Number,
			required: false,
		},
		date: {
			type: String,
			required: true,
			unique: true,
		},
	},
	{
		timestamps: {
			createdAt: 'created_at',
			updatedAt: 'updated_at',
		},
		versionKey: false,
	},
);

shiftSchema.statics.findShiftById = async function (id: string) {
	if (!id) {
		throw new ErrorWithStatus(
			'Bad Request',
			'Please provide a valid ID!',
			STATUS_CODES.BAD_REQUEST,
			'shift',
		);
	}

	const shift = await this.findById(id);

	if (!shift) {
		throw new ErrorWithStatus(
			'Not Found Error',
			`No shift found with ID ${id}!`,
			STATUS_CODES.NOT_FOUND,
			'shift',
		);
	}

	return shift;
};

export const Shift = model<IShiftDoc, IShiftModel>('Shift', shiftSchema);
