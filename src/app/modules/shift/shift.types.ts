import type { Document, Types } from 'mongoose';
import type {
	ClockMinute,
	ClockTime,
	HourMinutes,
	WeekDay,
} from 'nhb-toolbox/date/types';
import type { Enumerate } from 'nhb-toolbox/number/types';
import type { TupleOf } from 'nhb-toolbox/utils/types';

export interface ICreateShift {
	user: Types.ObjectId;
	start_time: ClockTime;
	end_time: ClockTime;
	date: string;
	working_hours: HourMinutes;
	break_hours?: `0${Enumerate<4>}:${ClockMinute}` | '04:00';
	working_mins: number;
	break_mins: number;
}

export interface IShiftDoc extends Required<ICreateShift>, Document {
	_id: Types.ObjectId;
	created_at: string;
	updated_at: string;
}

export interface ICreateBulkShift extends ICreateShift {
	date_range?: TupleOf<string, 2>;
	weekends?: Array<WeekDay>;
}
