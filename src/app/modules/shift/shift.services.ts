import {
	chronos,
	convertMinutesToTime,
	pickFields,
	sanitizeData,
} from 'nhb-toolbox';
import type { Enumerate } from 'nhb-toolbox/number/types';
import { ErrorWithStatus } from '../../classes/ErrorWithStatus';
import { QueryBuilder } from '../../classes/QueryBuilder';
import { STATUS_CODES } from '../../constants';
import type { TEmail } from '../../types';
import { User } from '../user/user.model';
import { Shift } from './shift.model';
import type { ICreateBulkShift, ICreateShift } from './shift.types';
import { computeShiftDurations } from './shift.utils';

const createShiftInDB = async (
	payload: ICreateShift | ICreateBulkShift,
	email: TEmail | undefined,
) => {
	const user = await User.validateUser(email);

	payload.user = user._id;

	const computed = { ...payload, ...computeShiftDurations(payload) };

	if ('date_range' in computed && computed.date_range) {
		const workingDates = chronos().getDatesInRange({
			format: 'utc',
			from: computed?.date_range?.[0],
			to: computed?.date_range?.[1],
			skipDays: computed?.weekends,
		});

		const shiftsInRange: ICreateShift[] = workingDates?.map((date) => ({
			date: chronos(date).startOf('day').toISOString(),
			...pickFields(computed, [
				'user',
				'break_hours',
				'break_mins',
				'start_time',
				'end_time',
				'working_hours',
				'working_mins',
			]),
		}));

		const newShifts = await Shift.insertMany(shiftsInRange);

		return newShifts;
	} else {
		computed.date = chronos(computed.date).toISOString();

		const newShift = await Shift.create(computed);

		return newShift;
	}
};

const getUserShiftsFromDB = async (
	email: TEmail | undefined,
	query?: Record<string, unknown>,
) => {
	const user = await User.validateUser(email);

	let selectedMonth = chronos().startOf('month');
	let monthName = selectedMonth.monthName();

	const year = query?.year ? Number(query?.year) : selectedMonth.year;
	const monthIndex = query?.year && !query.month ? 1 : Number(query?.month);

	if (monthIndex) {
		if (monthIndex >= 1 && monthIndex <= 12) {
			selectedMonth = chronos(year, monthIndex);

			monthName = selectedMonth.monthName(
				(monthIndex - 1) as Enumerate<12>,
			);
		} else {
			throw new ErrorWithStatus(
				'Invalid Month',
				`Month must be between 1-12, you provided: “${monthIndex}”`,
				STATUS_CODES.BAD_REQUEST,
				'query.month',
			);
		}
	}

	const start = selectedMonth.toISOString();
	const end = selectedMonth.endOf('month').toISOString();

	const filter = {
		user: user._id,
		date: { $gte: start, $lt: end },
	};

	const shiftQuery = new QueryBuilder(
		Shift.find(filter),
		query?.sort_by ? query : { ...query, sort_by: 'date' },
	)
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
		year: year,
		month: monthName,
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

	const shifts = await shiftQuery.modelQuery;

	return shifts;
};

const updateShiftInDB = async (
	id: string,
	payload: Partial<ICreateShift>,
	email: TEmail | undefined,
) => {
	const existingShift = await Shift.findShiftById(id);

	const user = await User.validateUser(email);

	if (!existingShift.user.equals(user?._id)) {
		throw new ErrorWithStatus(
			'Authorization Error',
			'You do not own this shift!',
			STATUS_CODES.UNAUTHORIZED,
			'auth',
		);
	}

	const computed = {
		...payload,
		...sanitizeData(computeShiftDurations(payload, existingShift), {
			ignoreFalsy: true,
		}),
	};

	const updatedShift = await Shift.findOneAndUpdate({ _id: id }, computed, {
		runValidators: true,
		new: true,
	});

	return updatedShift;
};

const deleteShiftFromDB = async (id: string, email: TEmail | undefined) => {
	const existingShift = await Shift.findShiftById(id);

	const user = await User.validateUser(email);

	if (!existingShift.user.equals(user?._id)) {
		throw new ErrorWithStatus(
			'Authorization Error',
			'You do not own this shift!',
			STATUS_CODES.UNAUTHORIZED,
			'auth',
		);
	}

	const result = await Shift.deleteOne({ _id: id });

	if (result.deletedCount < 1) {
		throw new ErrorWithStatus(
			'Not Found Error',
			`No shift found with ID ${id}!`,
			STATUS_CODES.NOT_FOUND,
			'shift',
		);
	}
};

export const shiftServices = {
	createShiftInDB,
	getUserShiftsFromDB,
	getAllShiftsFromDB,
	updateShiftInDB,
	deleteShiftFromDB,
};
