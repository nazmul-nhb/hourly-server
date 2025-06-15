import catchAsync from '../../utilities/catchAsync';
import sendResponse from '../../utilities/sendResponse';
import { shiftServices } from './shift.services';

const createNewShift = catchAsync(async (req, res) => {
	const shifts = await shiftServices.createShiftInDB(
		req?.body,
		req?.user?.email,
	);

	sendResponse(res, 'Shift', 'GET', shifts, 'Created new shift for the day!');
});

const getAllShifts = catchAsync(async (_req, res) => {
	const shifts = await shiftServices.getAllShiftsFromDB();

	sendResponse(res, 'Shift', 'GET', shifts);
});

export const shiftControllers = { createNewShift, getAllShifts };
