import { WEEK_DAYS } from 'nhb-toolbox/constants';
import { z } from 'zod';

const ClockTimeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const ClockTime = z
	.string()
	.trim()
	.regex(ClockTimeRegex, { message: 'Invalid ClockTime format (HH:MM)' });

const BreakTime = z.union([
	z.literal('08:00'),
	z
		.string()
		.trim()
		.regex(/^0[0-7]:[0-5]\d$/, {
			message: 'Break-time cannot be more than 8 hours (08:00)',
		}),
]);

const IsoZonedDate = z
	.string()
	.trim()
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
		break_hours: BreakTime.optional(),
		date: IsoZonedDate.optional(),
		date_range: z.tuple([IsoZonedDate, IsoZonedDate]).optional(),
		weekends: Weekends.optional(),
	})
	.strict();

const updateSchema = creationSchema
	.omit({ date_range: true, weekends: true })
	.partial()
	.strict();

export const shiftValidations = { creationSchema, updateSchema };
