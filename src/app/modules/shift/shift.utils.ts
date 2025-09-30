import { ErrorWithStatus } from '@/classes/ErrorWithStatus';
import type { ICreateShift, IShiftDoc } from '@/modules/shift/shift.types';
import { chronos, convertMinutesToTime, getTotalMinutes, isValidArray } from 'nhb-toolbox';
import { STATUS_CODES } from 'nhb-toolbox/constants';
import type { ClockTime } from 'nhb-toolbox/date/types';

interface IComputedDurations {
	break_hours: ICreateShift['break_hours'];
	break_mins: number;
	working_hours: ClockTime;
	working_mins: number;
}

/**
 * * Computes working and break time in minutes and formatted string for a shift payload.
 *
 * @param data - The shift payload (must include any of start_time, end_time, break_hours)
 * @returns Computed `break_hours`, `break_mins`, `working_hours` and `working_mins`
 */
export const computeShiftDurations = <T extends Partial<ICreateShift>>(
	data: T,
	previousData?: IShiftDoc
): IComputedDurations => {
	const break_hours = data?.break_hours ?? previousData?.break_hours ?? '00:00';
	const break_mins = getTotalMinutes(break_hours);

	const shift_mins =
		getTotalMinutes(data.end_time ?? previousData?.end_time ?? '00:00') -
		getTotalMinutes(data.start_time ?? previousData?.start_time ?? '00:00');

	if (break_mins >= shift_mins) {
		throw new ErrorWithStatus(
			'Invalid Break-time',
			'Break-time cannot be greater than or equal to the total shift duration!',
			STATUS_CODES.BAD_REQUEST,
			'shift.break_hours'
		);
	}

	const working_mins = shift_mins - break_mins;
	const working_hours = convertMinutesToTime(working_mins)?.padStart(5, '0') as ClockTime;

	return { break_hours, break_mins, working_mins, working_hours };
};

/**
 * * Extracts the time from a date string.
 *
 * @param date - The date string in ISO format (e.g., "2025-10-20T16:45:40.300Z")
 * @returns The time portion of the date string (e.g., "16:45")
 */
export const getTime = (date: string) => {
	return date?.slice(11, 16);
};

/**
 * * Creates a date string in ISO format.
 *
 * @param time - The time portion of the date (e.g., "16:45")
 * @param date - The date portion of the date (e.g., "2025-10-20")
 * @returns The complete date string in ISO format (e.g., "2025-10-20T16:45:00.000Z")
 */
export const createDateString = (time: ClockTime, date: string) => {
	return `${date}T${time}:00.000Z`;
};

/**
 * * Checks for overlapping shifts. Throws an error if the incoming shift overlaps with any existing shifts.
 * @param shifts - Array of existing shifts to check against
 * @param incoming - The incoming date string (e.g., "2025-10-20")
 * @param start_time - The start time of the incoming shift (e.g., "16:45")
 * @param end_time - The end time of the incoming shift (e.g., "18:00")
 * @param path - The path to include in the error message
 * @throws {ErrorWithStatus} If there is a conflict with existing shifts
 */
export const throwShiftError = <T extends IShiftDoc>(
	shifts: T[],
	incoming: string,
	start_time: ClockTime,
	end_time: ClockTime,
	path: string
) => {
	const throwError = (base: string, start: string, end: string) => {
		if (chronos(base).isBetween(start, end, '[]')) {
			throw new ErrorWithStatus(
				'Conflict Error',
				`Shift time '${getTime(base)}' overlaps with shift 'from ${getTime(start)} to ${getTime(end)}' on ${incoming}!`,
				STATUS_CODES.CONFLICT,
				path
			);
		}
	};

	if (isValidArray(shifts)) {
		for (const entry of shifts) {
			const targetStart = createDateString(entry.start_time, entry.date.slice(0, 10));
			const targetEnd = createDateString(entry.end_time, entry.date.slice(0, 10));
			const incomingStart = createDateString(start_time, incoming);
			const incomingEnd = createDateString(end_time, incoming);

			throwError(incomingStart, targetStart, targetEnd);
			throwError(incomingEnd, targetStart, targetEnd);
			throwError(targetStart, incomingStart, incomingEnd);
			throwError(targetEnd, incomingStart, incomingEnd);
		}
	}
};
