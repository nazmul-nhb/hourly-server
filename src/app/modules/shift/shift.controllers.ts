import catchAsync from '@/utilities/catchAsync';
import sendResponse from '@/utilities/sendResponse';
import { shiftServices } from '@/modules/shift/shift.services';

const createNewShift = catchAsync(async (req, res) => {
	const shifts = await shiftServices.createShiftInDB(req?.body, req?.user?.email);

	sendResponse(
		res,
		'Shift',
		'GET',
		shifts,
		Array.isArray(shifts) ?
			`${shifts?.length} shifts have been created for the selected dates in the range!`
		:	'Created new shift for the day!'
	);
});

const getUserShifts = catchAsync(async (req, res) => {
	const shifts = await shiftServices.getUserShiftsFromDB(req?.user?.email, req.query);

	sendResponse(res, 'Shift', 'GET', shifts);
});

const updateUserShift = catchAsync(async (req, res) => {
	const shift = await shiftServices.updateShiftInDB(
		req?.params?.id,
		req?.body,
		req.user?.email
	);

	sendResponse(res, 'Shift', 'PATCH', shift);
});

const deleteUserShift = catchAsync(async (req, res) => {
	await shiftServices.deleteShiftFromDB(req?.params?.id, req.user?.email);

	sendResponse(res, 'Shift', 'DELETE');
});

const getAllShifts = catchAsync(async (_req, res) => {
	const shifts = await shiftServices.getAllShiftsFromDB();

	sendResponse(res, 'Shift', 'GET', shifts);
});

export const shiftControllers = {
	createNewShift,
	getUserShifts,
	updateUserShift,
	deleteUserShift,
	getAllShifts,
};
