import { z } from 'zod';
import { WEEK_DAYS } from './shift.constants';

const ClockTimeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const ClockTime = z
	.string()
	.regex(ClockTimeRegex, { message: 'Invalid ClockTime format (HH:MM)' });

const BreakTime = z.union([
	z.literal('04:00'),
	z.string().regex(/^0[0-3]:[0-5]\d$/, {
		message: 'Break-time cannot be more than 4 hours (04:00)',
	}),
]);

const IsoZonedDate = z
	.string()
	.regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}(Z|[+-]\d{2}:\d{2})$/, {
		message: 'Invalid ISO date format with timezone!',
	});

const Weekends = z
	.array(z.enum(WEEK_DAYS))
	.max(6, { message: 'Weekends cannot be more than 6 days!' })
	.refine((days) => new Set(days).size === days.length, {
		message: 'Weekends must be unique!',
	});

const creationSchema = z
	.object({
		start_time: ClockTime,
		end_time: ClockTime,
		break: BreakTime.optional(),
		date: IsoZonedDate.optional(),
		date_range: z.tuple([IsoZonedDate, IsoZonedDate]).optional(),
		weekends: Weekends.optional(),
	})
	.strict();

export const shiftValidations = { creationSchema };
