import { chronos, convertMinutesToTime, getTotalMinutes } from 'nhb-toolbox';
import type { ClockTime } from 'nhb-toolbox/date/types';
import { ErrorWithStatus } from '../../classes/ErrorWithStatus';
import { STATUS_CODES } from '../../constants';
import type { ICreateShift, IShiftDoc } from './shift.types';

interface IComputedDurations {
	break_hours: ICreateShift['break_hours'];
	break_mins: number;
	working_hours: ClockTime;
	working_mins: number;
	date: string;
}

/**
 * * Computes working and break time in minutes and formatted string for a shift payload.
 *
 * @param data - The shift payload (must include any of start_time, end_time, break_hours)
 * @returns A payload extended with `break_mins`, `working_mins`, `working_hours`
 */
export const computeShiftDurations = <T extends Partial<ICreateShift>>(
	data: T,
	previousData?: IShiftDoc,
): IComputedDurations => {
	const break_hours =
		data?.break_hours ?? previousData?.break_hours ?? '00:00';
	const break_mins = getTotalMinutes(break_hours);

	const shift_mins =
		getTotalMinutes(data.end_time ?? previousData?.end_time ?? '00:00') -
		getTotalMinutes(data.start_time ?? previousData?.start_time ?? '00:00');

	if (break_mins >= shift_mins) {
		throw new ErrorWithStatus(
			'Invalid Break-time',
			'Break-time cannot be greater than or equal to the total shift duration!',
			STATUS_CODES.BAD_REQUEST,
			'shift.break_hours',
		);
	}

	const working_mins = shift_mins - break_mins;
	const working_hours = convertMinutesToTime(working_mins)?.padStart(
		5,
		'0',
	) as ClockTime;

	const date =
		data?.date ? chronos(data?.date).startOf('day').toISOString() : '';

	return { break_hours, break_mins, working_mins, working_hours, date };
};
