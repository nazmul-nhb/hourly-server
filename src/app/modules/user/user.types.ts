import type { Document, Model, Types } from 'mongoose';
import type { TEmail, TUserRole } from '../../types';

export interface IUser {
	email: TEmail;
	password: string;
	userName: string;
	role: TUserRole;
	isActive?: boolean;
}

export interface ILoginCredentials {
	email: TEmail;
	password: string;
}

export interface ITokens {
	accessToken: string;
	refreshToken: string;
	user: ICurrentUser;
}

export interface IUserDoc extends IUser, Document {
	_id: Types.ObjectId;
}

export interface IUserModel extends Model<IUserDoc> {
	validateUser(email?: TEmail): Promise<IUserDoc>;
}

export interface ICurrentUser extends Omit<IUser, 'password'> {
	_id: Types.ObjectId;
	createdAt: string;
	updatedAt: string;
}
