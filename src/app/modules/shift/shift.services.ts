import { extractTotalMinutesFromTime } from 'nhb-toolbox';
import type { ClockTime } from 'nhb-toolbox/date/types';
import { ErrorWithStatus } from '../../classes/ErrorWithStatus';
import { QueryBuilder } from '../../classes/QueryBuilder';
import { STATUS_CODES } from '../../constants';
import type { TEmail } from '../../types';
import { User } from '../user/user.model';
import { Shift } from './shift.model';
import type { ICreateShift } from './shift.types';

const createShiftInDB = async (payload: ICreateShift, email?: TEmail) => {
	const user = await User.validateUser(email);

	payload.user = user._id;
	payload.break = payload.break ?? '00:00';

	const breakMins = extractTotalMinutesFromTime(payload.break);

	const shiftMins =
		extractTotalMinutesFromTime(payload.end_time) -
		extractTotalMinutesFromTime(payload.start_time);

	if (breakMins >= shiftMins) {
		throw new ErrorWithStatus(
			'Invalid Break-time',
			'Break-time cannot be greater than the total shift duration!',
			STATUS_CODES.BAD_REQUEST,
			'shift.break',
		);
	}

	const workingMins = shiftMins - breakMins;

	payload.working_hours =
		`${String(Math.floor(workingMins / 60)).padStart(2, '0')}:${String(workingMins % 60).padStart(2, '0')}` as ClockTime;

	const newShift = await Shift.create(payload);

	return newShift;
};

const getAllShiftsFromDB = async (query?: Record<string, unknown>) => {
	const shiftQuery = new QueryBuilder(Shift.find(), query).sort();
	// const shifts = await Shift.find({});

	const shifts = await shiftQuery.modelQuery;

	return shifts;
};

export const shiftServices = { createShiftInDB, getAllShiftsFromDB };
