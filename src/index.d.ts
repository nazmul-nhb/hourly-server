import type { DecodedUser } from '@/types/interfaces';

declare global {
	namespace Express {
		interface Request {
			user?: DecodedUser;
		}
	}
}
