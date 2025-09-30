import { z, ZodObject, type ZodOptional, type ZodType } from 'zod';

/** - Represents a Zod object shape (i.e., the `.shape` property of a ZodObject). */
export type ZodShape = Record<string, ZodType>;

/**
 * * Type helper: transforms a ZodType into its deep-partial schema type.
 * - This keeps `z.infer<typeof updateSchema>` precise.
 */
export type Deepen<T extends ZodType> =
	T extends ZodObject<infer S extends ZodShape> ?
		ZodObject<{ [K in keyof S]: ZodOptional<Deepen<S[K]>> }>
	:	T;

/** - Type helper to transform a Zod object shape into its deep-partial schema shape. */
export type ZodDeepPartial<Shape extends ZodShape> = {
	[K in keyof Shape]: ZodOptional<Deepen<Shape[K]>>;
};

/**
 * * Recursively makes all fields optional ("deep partial"), including nested objects.
 * @param schema - Zod object schema to be transformed into a deep-partial schema.
 * @returns A new Zod object schema where all fields are deeply optional.
 */
export function createPartialSchema<Shape extends ZodShape>(schema: ZodObject<Shape>) {
	const shape = schema.shape;

	const partialShape = Object.fromEntries(
		Object.entries(shape).map(([k, field]) => [k, deepPartial(field).optional()])
	) as ZodDeepPartial<Shape>;

	return z.object(partialShape);
}

/**
 * Deep-partial any ZodType while preserving runtime validation.
 * @param schema - Any ZodType (object, primitive, etc.)
 * @returns A new ZodType where all fields are deeply optional.
 */
const deepPartial = (schema: ZodType): ZodType => {
	// Objects → recurse into .shape and make every prop optional
	if (schema instanceof ZodObject) {
		const inner = schema.shape;
		const next: ZodShape = {};

		for (const key in inner) {
			next[key] = deepPartial(inner[key]).optional();
		}

		return z.object(next).partial();
	}

	// Fallback (primitives, enums, literals, etc.)
	return schema.optional();
};
