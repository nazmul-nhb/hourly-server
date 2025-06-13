import configs from '../../configs';
import catchAsync from '../../utilities/catchAsync';
import sendResponse from '../../utilities/sendResponse';
import { authServices } from './auth.services';

/** * Register a new user */
const registerUser = catchAsync(async (req, res) => {
	const user = await authServices.registerUserInDB(req.body);

	sendResponse(res, 'User', 'POST', user, 'User registered successfully!');
});

/** * Login a user */
const loginUser = catchAsync(async (req, res) => {
	const result = await authServices.loginUser(req.body);

	const { refresh_token, access_token, user } = result;

	res.cookie('refresh_token', refresh_token, {
		secure: configs.NODE_ENV === 'production',
		httpOnly: true,
	});

	sendResponse(
		res,
		'User',
		'OK',
		{ user, token: access_token },
		'Login successful!',
	);
});

/** * Generate new access token. */
const refreshToken = catchAsync(async (req, res) => {
	const { refresh_token } = req.cookies;

	const token = await authServices.refreshToken(refresh_token);

	sendResponse(
		res,
		'N/A',
		'OK',
		token,
		'Successfully retrieved new access token!',
	);
});

/** * Get current logged in user. */
const getCurrentUser = catchAsync(async (req, res) => {
	const user = await authServices.getCurrentUserFromDB(req.user);

	sendResponse(res, 'User', 'GET', user);
});

export const authControllers = {
	registerUser,
	loginUser,
	refreshToken,
	getCurrentUser,
};
