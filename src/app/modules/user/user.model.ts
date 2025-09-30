import { ErrorWithStatus } from '@/classes/ErrorWithStatus';
import { USER_ROLES } from '@/constants';
import type { TEmail } from '@/types';
import { hashPassword } from '@/utilities/authUtilities';
import { Schema, model } from 'mongoose';
import type { IUserDoc, IUserModel } from '@/modules/user/user.types';
import { STATUS_CODES } from 'nhb-toolbox/constants';

const userSchema = new Schema<IUserDoc>(
	{
		user_name: {
			type: String,
			trim: true,
			unique: true,
		},
		email: {
			type: String,
			required: true,
			trim: true,
			unique: true,
		},
		first_name: {
			type: String,
			required: true,
			trim: true,
		},
		last_name: {
			type: String,
			required: true,
			trim: true,
		},
		password: {
			type: String,
			required: true,
			trim: true,
			select: false,
		},
		role: {
			type: String,
			enum: USER_ROLES,
			default: 'user',
		},
		is_active: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: {
			createdAt: 'created_at',
			updatedAt: 'updated_at',
		},
		versionKey: false,
	}
);

// * Hash password and create username before saving the user in DB.
userSchema.pre('save', async function (next) {
	const base = this.first_name?.toLowerCase()?.replace(/\s+/g, '_');
	let userName = base;
	let suffix = 0;

	while (await User.exists({ user_name: userName })) {
		suffix += 1;
		userName = `${base}_${suffix}`;
	}

	this.user_name = userName;
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
			'user'
		);
	}

	const user: IUserDoc = await this.findOne({ email }).select('+password');

	if (!user) {
		throw new ErrorWithStatus(
			'Not Found Error',
			`No user found with email: ${email}!`,
			STATUS_CODES.NOT_FOUND,
			'user'
		);
	}

	if (!user.is_active) {
		throw new ErrorWithStatus(
			'Authentication Error',
			`User with email ${email} is not active!`,
			STATUS_CODES.FORBIDDEN,
			'user'
		);
	}

	return user;
};

export const User = model<IUserDoc, IUserModel>('User', userSchema);
