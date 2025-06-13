import { Schema, model } from 'mongoose';
import { ErrorWithStatus } from '../../classes/ErrorWithStatus';
import { STATUS_CODES, USER_ROLES } from '../../constants';
import { hashPassword } from '../../utilities/authUtilities';
import type { IUserDoc, IUserModel } from './user.types';
import type { TEmail } from '../../types';

const userSchema = new Schema<IUserDoc>(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			trim: true,
			unique: true,
		},
		image: {
			type: String,
			required: [true, 'Image is required!'],
			trim: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
			trim: true,
			select: false,
		},
		role: {
			type: String,
			enum: Object.values(USER_ROLES),
			default: USER_ROLES.USER,
		},
		isActive: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
		versionKey: false,
	},
);

// * Hash password before saving the user in DB.
userSchema.pre('save', async function (next) {
	this.password = await hashPassword(this.password);

	next();
});

/** Static method to check if user exists */
userSchema.statics.validateUser = async function (email?: TEmail) {
	if (!email) {
		throw new ErrorWithStatus(
			'Authentication Error',
			'Please provide a valid email!',
			STATUS_CODES.BAD_REQUEST,
			'user',
		);
	}

	const user: IUserDoc = await this.findOne({ email }).select('+password');

	if (!user) {
		throw new ErrorWithStatus(
			'Not Found Error',
			`No user found with email: ${email}!`,
			STATUS_CODES.NOT_FOUND,
			'user',
		);
	}

	if (!user.isActive) {
		throw new ErrorWithStatus(
			'Authentication Error',
			`User with email ${email} is not active!`,
			STATUS_CODES.FORBIDDEN,
			'user',
		);
	}

	return user;
};

export const User = model<IUserDoc, IUserModel>('User', userSchema);
