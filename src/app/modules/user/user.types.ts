import type { Document, Model, Types } from 'mongoose';
import type { TEmail, TUserRole } from '../../types';

export interface IUser extends ILoginCredentials {
	first_name: string;
	last_name: string;
	role: TUserRole;
	user_name: string;
	is_active: boolean;
}

export interface ILoginCredentials {
	email: TEmail;
	password: string;
}

export interface ITokens {
	access_token: string;
	refresh_token: string;
	user: ICurrentUser;
}

export interface IPlainUser extends IUser {
	_id: Types.ObjectId;
	created_at: string;
	updated_at: string;
}

export interface IUserDoc extends IUser, Document {
	_id: Types.ObjectId;
}

export interface IUserModel extends Model<IUserDoc> {
	validateUser(email?: TEmail): Promise<IUserDoc>;
}

export interface ICurrentUser extends Omit<IUser, 'password'> {
	_id: Types.ObjectId;
	created_at: string;
	updated_at: string;
}
