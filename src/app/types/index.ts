import type { Types } from 'mongoose';
import type { COLLECTIONS, USER_ROLES } from '@/constants';
import type { STATUS_CODES } from 'nhb-toolbox/constants';
import type { Branded } from 'nhb-toolbox/types';

export type ExceptionSignal = NodeJS.UncaughtExceptionOrigin | NodeJS.Signals;

export type TCollection = (typeof COLLECTIONS)[number];

export type TMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'OK';

export type TResponseDetails = { message: string; statusCode: number };

export type TStatusCode = (typeof STATUS_CODES)[keyof typeof STATUS_CODES];

export type TUserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export type TEmail = Branded<string, 'email'>;

export type SearchField<T> = {
	[K in keyof T]: T[K] extends string | number ? K : never;
}[keyof T];

export type NumericKeys<T> = {
	[K in keyof T]: T[K] extends number ? K : never;
}[keyof T];

export type ExcludeField<T> = `-${Extract<ExcludeVirtuals<FilterKeys<T>>, string>}`;

/** * Utility type to extract keys from `T` where the value is `string`, `number`, `boolean`, `Date` or `ObjectId`. */
type FilterKeys<T> = {
	[K in keyof T]: T[K] extends string | number | boolean | Date | Types.ObjectId ? K : never;
}[keyof T];

/** * Utility type to exclude Mongoose virtual properties (e.g., isNew). */
type ExcludeVirtuals<T> = Exclude<T, 'isNew' | 'id'>;
