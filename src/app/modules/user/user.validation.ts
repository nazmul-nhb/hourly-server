import { z } from 'zod';

/** Validation Schema for Creating new User */
const creationSchema = z
	.object({
		email: z
			.string()
			.email({ message: 'Please provide a valid email address!' }),
		password: z
			.string()
			.trim()
			.min(6, { message: 'Password must be at least 6 characters long!' })
			.max(20, {
				message: 'Password cannot be more than 20 characters!',
			}),
	})
	.strict();

/** User Validation Schema */
export const userValidations = { creationSchema };
