import type { Document, Types } from 'mongoose';
import type { ClockMinute, ClockTime } from 'nhb-toolbox/date/types';
import type { Enumerate } from 'nhb-toolbox/number/types';

export interface ICreateShift {
	user: Types.ObjectId;
	start_time: ClockTime;
	end_time: ClockTime;
	working_hours: ClockTime;
	date: string;
	break?: `0${Enumerate<4>}:${ClockMinute}` | '04:00';
}

export interface IShiftDoc extends ICreateShift, Document {
	_id: Types.ObjectId;
	created_at: string;
	updated_at: string;
}
