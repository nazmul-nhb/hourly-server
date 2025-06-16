import { Schema, model } from 'mongoose';
import type { IShiftDoc } from './shift.types';

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

export const Shift = model<IShiftDoc>('Shift', shiftSchema);
