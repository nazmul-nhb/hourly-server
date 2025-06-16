import {
	chronos,
	convertMinutesToTime,
	getTotalMinutes,
	pickFields,
} from 'nhb-toolbox';
import { ErrorWithStatus } from '../../classes/ErrorWithStatus';
import { QueryBuilder } from '../../classes/QueryBuilder';
import { STATUS_CODES } from '../../constants';
import type { TEmail } from '../../types';
import { User } from '../user/user.model';
import { Shift } from './shift.model';
import type { ICreateBulkShift, ICreateShift } from './shift.types';

const createShiftInDB = async (
	payload: ICreateShift | ICreateBulkShift,
	email: TEmail | undefined,
) => {
	const user = await User.validateUser(email);
	payload.user = user._id;

	payload.break_hours = payload.break_hours ?? '00:00';

	const breakMins = getTotalMinutes(payload.break_hours);
	payload.break_mins = breakMins;

	const shiftMins =
		getTotalMinutes(payload.end_time) - getTotalMinutes(payload.start_time);

	if (breakMins >= shiftMins) {
		throw new ErrorWithStatus(
			'Invalid Break-time',
			'Break-time cannot be greater than or equal to the total shift duration!',
			STATUS_CODES.BAD_REQUEST,
			'shift.break_hours',
		);
	}

	const workingMins = shiftMins - breakMins;
	payload.working_mins = workingMins;

	payload.working_hours = convertMinutesToTime(workingMins);

	if ('date_range' in payload && payload.date_range) {
		const workingDates = chronos().getDatesInRange({
			format: 'utc',
			from: payload.date_range[0],
			to: payload.date_range[1],
			skipDays: payload?.weekends,
		});

		const shiftsInRange = workingDates?.map((date) => ({
			date,
			...pickFields(payload, [
				'user',
				'break_hours',
				'break_mins',
				'start_time',
				'end_time',
				'working_hours',
				'working_mins',
			]),
		})) as ICreateShift[];

		const newShifts = await Shift.insertMany(shiftsInRange);

		return newShifts;
	} else {
		payload.date = chronos(payload.date).toISOString();

		const newShift = await Shift.create(payload);

		return newShift;
	}
};

const getUserShiftsFromDB = async (
	email: TEmail | undefined,
	query?: Record<string, unknown>,
) => {
	const user = await User.validateUser(email);

	const shiftQuery = new QueryBuilder(Shift.find({ user: user._id }), query)
		.filter()
		.sort();

	const total_shifts = await Shift.countDocuments(
		shiftQuery.modelQuery.getFilter(),
	);

	const [{ total_working_mins = 0, total_break_mins = 0 } = {}] =
		await Shift.aggregate<{
			total_working_mins: number;
			total_break_mins: number;
		}>([
			{ $match: shiftQuery.modelQuery.getFilter() },
			{
				$group: {
					_id: null,
					total_working_mins: { $sum: '$working_mins' },
					total_break_mins: { $sum: '$break_mins' },
				},
			},
		]);

	const user_shifts = await shiftQuery.modelQuery;

	return {
		total_shifts,
		total_break_mins,
		total_break_hours: convertMinutesToTime(total_break_mins),
		total_working_mins,
		total_working_hours: convertMinutesToTime(total_working_mins),
		user_shifts,
	};
};

const getAllShiftsFromDB = async (query?: Record<string, unknown>) => {
	const shiftQuery = new QueryBuilder(Shift.find(), query).sort();
	// const shifts = await Shift.find({});

	const shifts = await shiftQuery.modelQuery;

	return shifts;
};

export const shiftServices = {
	createShiftInDB,
	getUserShiftsFromDB,
	getAllShiftsFromDB,
};
