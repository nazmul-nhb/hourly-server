import { chronos, extractTotalMinutesFromTime, pickFields } from 'nhb-toolbox';
import type { ClockTime } from 'nhb-toolbox/date/types';
import { ErrorWithStatus } from '../../classes/ErrorWithStatus';
import { QueryBuilder } from '../../classes/QueryBuilder';
import { STATUS_CODES } from '../../constants';
import type { TEmail } from '../../types';
import { User } from '../user/user.model';
import { Shift } from './shift.model';
import type { ICreateBulkShift, ICreateShift } from './shift.types';

const createShiftInDB = async (
	payload: ICreateShift | ICreateBulkShift,
	email?: TEmail,
) => {
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
			'Break-time cannot be greater than or equal to the total shift duration!',
			STATUS_CODES.BAD_REQUEST,
			'shift.break',
		);
	}

	const workingMins = shiftMins - breakMins;

	payload.working_hours =
		`${String(Math.floor(workingMins / 60)).padStart(2, '0')}:${String(workingMins % 60).padStart(2, '0')}` as ClockTime;

	if ('date_range' in payload && payload.date_range) {
		const start = chronos(payload.date_range[0]);
		const end = chronos(payload.date_range[1]);

		const datesInRange: string[] = [];

		let current = start;
		while (current.isSameOrBefore(end, 'day')) {
			datesInRange.push(current.toISOString());
			current = current.add(1, 'day');
		}

		const weekends =
			payload?.weekends?.flatMap((weekend) =>
				chronos.getDatesForDay(weekend, {
					format: 'utc',
					from: start,
					to: end,
				}),
			) || [];

		const workingDates = datesInRange?.filter(
			(date) =>
				!weekends?.some((weekend) =>
					chronos(date).isSame(weekend, 'day'),
				),
		);

		const shiftsInRange = workingDates?.map((date) => ({
			date,
			...pickFields(payload, [
				'user',
				'break',
				'working_hours',
				'start_time',
				'end_time',
			]),
		})) as ICreateShift[];

		const newShifts = await Shift.insertMany(shiftsInRange);

		return newShifts;
	} else {
		const newShift = await Shift.create(payload);

		return newShift;
	}
};

const getAllShiftsFromDB = async (query?: Record<string, unknown>) => {
	const shiftQuery = new QueryBuilder(Shift.find(), query).sort();
	// const shifts = await Shift.find({});

	const shifts = await shiftQuery.modelQuery;

	return shifts;
};

export const shiftServices = { createShiftInDB, getAllShiftsFromDB };
