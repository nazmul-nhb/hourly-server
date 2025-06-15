import type { Document, Types } from 'mongoose';
import type { ClockMinute, ClockTime } from 'nhb-toolbox/date/types';
import type { Enumerate } from 'nhb-toolbox/number/types';
import type { TupleOf } from 'nhb-toolbox/utils/types';
import type { WEEK_DAYS } from './shift.constants';

export interface ICreateShift {
	user: Types.ObjectId;
	start_time: ClockTime;
	end_time: ClockTime;
	working_hours: ClockTime;
	date: string;
	break?: `0${Enumerate<4>}:${ClockMinute}` | '04:00';
	working_mins: number;
	break_mins: number;
}

export interface IShiftDoc extends ICreateShift, Document {
	_id: Types.ObjectId;
	created_at: string;
	updated_at: string;
}

export type TWeekDay = (typeof WEEK_DAYS)[number];

export interface ICreateBulkShift extends ICreateShift {
	date_range?: TupleOf<string, 2>;
	weekends?: TupleOf<TWeekDay, 6>;
}
