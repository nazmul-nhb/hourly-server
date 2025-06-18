import {
	chronos,
	convertMinutesToTime,
	getTotalMinutes,
	pickFields,
} from 'nhb-toolbox';
import type { ICreateBulkShift, ICreateShift } from './shift.types';
import { ErrorWithStatus } from '../../classes/ErrorWithStatus';
import { STATUS_CODES } from '../../constants';
import type { ClockTime } from 'nhb-toolbox/date/types';

/**
 * * Computes working and break time in minutes and formatted string for a shift payload.
 *
 * @param payload - The shift payload (must include start_time, end_time, break_hours)
 * @returns A payload extended with `break_mins`, `working_mins`, `working_hours`
 */
export const computeShiftDurations = <T extends Partial<ICreateShift>>(
	payload: T,
): {
	break_hours: ICreateShift['break_hours'];
	break_mins: number;
	working_hours: ClockTime;
	working_mins: number;
} => {
	const break_hours = payload?.break_hours ?? '00:00';
	const break_mins = getTotalMinutes(break_hours);

	const shift_mins =
		getTotalMinutes(payload?.end_time as ClockTime) -
		getTotalMinutes(payload?.start_time as ClockTime);

	if (break_mins >= shift_mins) {
		throw new ErrorWithStatus(
			'Invalid Break-time',
			'Break-time cannot be greater than or equal to the total shift duration!',
			STATUS_CODES.BAD_REQUEST,
			'shift.break_hours',
		);
	}

	const working_mins = shift_mins - break_mins;
	const working_hours = convertMinutesToTime(working_mins) as ClockTime;

	return {
		break_hours,
		break_mins,
		working_mins,
		working_hours,
	};
};

export const generateShiftsFromRange = (
	payload: ICreateBulkShift,
): ICreateShift[] => {
	const workingDates = chronos().getDatesInRange({
		format: 'utc',
		from: payload.date_range[0],
		to: payload.date_range[1],
		skipDays: payload?.weekends,
	});

	return workingDates.map((date) => ({
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
	}));
};
