import { ErrorWithStatus } from '../../classes/ErrorWithStatus';
import configs from '../../configs';
import { STATUS_CODES } from '../../constants';
import type { DecodedUser } from '../../types/interfaces';
import {
	comparePassword,
	generateToken,
	verifyToken,
} from '../../utilities/authUtilities';
import { User } from '../user/user.model';
import type {
	ICurrentUser,
	ILoginCredentials,
	ITokens,
	IUser,
} from '../user/user.types';

/**
 * Create a new user in MongoDB `user` collection.
 * @param payload User data from `req.body`.
 * @returns User object from MongoDB.
 */
const registerUserInDB = async (payload: IUser) => {
	const newUser = await User.create(payload);

	const { _id, userName, email } = newUser.toObject();

	const user = { _id, userName, email };

	return user;
};

/**
 * * Login user.
 * @param payload Login credentials (`email` and `password`).
 * @returns Token as object.
 */
const loginUser = async (payload: ILoginCredentials): Promise<ITokens> => {
	// * Validate and extract user from DB.
	const user = await User.validateUser(payload.email);

	// * Check if password matches with the saved password in DB.
	const passwordMatched = await comparePassword(
		payload?.password,
		user?.password,
	);

	if (!passwordMatched) {
		throw new ErrorWithStatus(
			'Authorization Error',
			`Invalid credentials!`,
			STATUS_CODES.UNAUTHORIZED,
			'auth',
		);
	}

	// * Create tokens and send to the client.
	const jwtPayload = {
		email: user.email,
		role: user.role,
	};

	const accessToken = generateToken(
		jwtPayload,
		configs.accessSecret,
		configs.accessExpireTime,
	);

	const refreshToken = generateToken(
		jwtPayload,
		configs.refreshSecret,
		configs.refreshExpireTime,
	);

	const { password: _, ...userInfo } = user.toObject();

	return { accessToken, refreshToken, user: userInfo as ICurrentUser };
};

/**
 * Refresh token.
 * @param token Refresh token from client.
 * @returns New access token.
 */
const refreshToken = async (token: string): Promise<{ token: string }> => {
	// * Verify and decode token
	const decodedToken = verifyToken(configs.refreshSecret, token);

	// * Validate and extract user from DB.
	const user = await User.validateUser(decodedToken.email);

	// * Create token and send to the  client.
	const jwtPayload = {
		email: user.email,
		role: user.role,
	};

	const accessToken = generateToken(
		jwtPayload,
		configs.accessSecret,
		configs.accessExpireTime,
	);

	return { token: accessToken };
};

/** * Get current user from DB. */
const getCurrentUserFromDB = async (client?: DecodedUser) => {
	const user = await User.validateUser(client?.email);

	const { password: _, ...userInfo } = user.toObject();

	return userInfo as ICurrentUser;
};

export const authServices = {
	registerUserInDB,
	loginUser,
	refreshToken,
	getCurrentUserFromDB,
};
