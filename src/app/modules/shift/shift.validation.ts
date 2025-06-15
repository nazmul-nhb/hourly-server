import { z } from 'zod';

const ClockTimeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const ClockTime = z
	.string()
	.regex(ClockTimeRegex, { message: 'Invalid ClockTime format (HH:MM)' });

const BreakTime = z.union([
	z.literal('04:00'),
	z.string().regex(/^0[0-3]:[0-5]\d$/, {
		message: 'Break must be between 00:00 and 04:00',
	}),
]);

const IsoZonedDate = z
	.string()
	.regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}(Z|[+-]\d{2}:\d{2})$/, {
		message: 'Invalid ISO date format with timezone',
	});

const creationSchema = z
	.object({
		start_time: ClockTime,
		end_time: ClockTime,
		break: BreakTime.optional(),
		date: IsoZonedDate.optional(),
	})
	.strict();

export const shiftValidations = { creationSchema };
