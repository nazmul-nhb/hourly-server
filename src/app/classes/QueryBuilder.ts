import type { ExcludeField, NumericKeys, SearchField } from '@/types';
import { type FilterQuery, Model, type Query } from 'mongoose';

/**
 * @class QueryBuilder
 * @description Utility class to build MongoDB queries.
 */
export class QueryBuilder<T> {
	/**
	 * Creates an instance of `QueryBuilder`.
	 * @param modelQuery Mongoose model on which the query will be performed.
	 * @param query Query parameters for filtering, sorting and paginating.
	 */
	constructor(
		public modelQuery: Query<T[], T> = Model.find(),
		public query?: Record<string, unknown>
	) {
		this.modelQuery = modelQuery;
		this.query = query;
	}

	/**
	 * Method to search for a keyword in the specified fields.
	 * @param searchFields An array of field names to search in.
	 * @returns The current instance of QueryBuilder.
	 */
	search(searchFields: SearchField<T>[]) {
		const keyword = this?.query?.search as string;

		if (keyword) {
			this.modelQuery = this.modelQuery.find({
				$or: searchFields.map(
					(field) =>
						({
							[field]: { $regex: keyword, $options: 'i' },
						}) as FilterQuery<T>
				),
			});
		}

		return this;
	}

	/**
	 * Method to filter the query based on the provided query parameters.
	 * @returns The current instance of QueryBuilder.
	 */
	filter() {
		const queryObj = { ...this?.query };

		const excludeFields = [
			'search',
			'sort_by',
			'sort_order',
			'filter',
			'page',
			'limit',
			'year',
			'month',
			'min',
			'max',
			'ids',
			'exclude',
			'select',
		];

		excludeFields.forEach((field) => delete queryObj[field]);

		if (Object.keys(queryObj).length > 0) {
			this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>);
		}

		return this;
	}

	/**
	 * Sorts the query based on `sort_by` and `sort_order` parameters.
	 * @returns The current instance of QueryBuilder.
	 */
	sort() {
		const sortField = (this?.query?.sort_by as string) || 'created_at';
		const sort_order = (this?.query?.sort_order as string) || 'desc';

		const sort_by: { [key: string]: 1 | -1 } = {};
		sort_by[sortField] = sort_order === 'asc' ? 1 : -1;

		this.modelQuery = this.modelQuery.sort(sort_by);

		return this;
	}

	/**
	 * Method to filter results based on a field's range (min & max values).
	 * Ensures that only numeric fields are allowed.
	 * @param field The numeric field to filter by range (e.g., "price").
	 * @returns The current instance of QueryBuilder.
	 */
	getRange(field: NumericKeys<T>) {
		const min = this?.query?.min ? Number(this?.query?.min) : undefined;
		const max = this?.query?.max ? Number(this?.query?.max) : undefined;

		if (Number.isNaN(min) || Number.isNaN(max)) {
			throw new Error(
				`Invalid range values for field '${String(field)}', must be numeric.`
			);
		}

		if (min != null || max != null) {
			const rangeFilter: FilterQuery<T> = {};
			if (min != null) rangeFilter[field] = { ...rangeFilter[field], $gte: min };
			if (max != null) rangeFilter[field] = { ...rangeFilter[field], $lte: max };

			this.modelQuery = this.modelQuery.find(rangeFilter);
		}

		return this;
	}

	/**
	 * Adds a filter to the query based on a specific field and a corresponding value from the query parameters.
	 * @param field The field to filter on.
	 * @param valueKey The key in the query parameters to extract the filter value.
	 * @returns The current instance of QueryBuilder.
	 */
	customFilter(field: keyof T, valueKey: string) {
		const value = this?.query?.[valueKey] as string;

		if (value) {
			this.modelQuery = this.modelQuery.find({
				[field]: value,
			} as FilterQuery<T>);
		}

		return this;
	}

	/**
	 * Fetches documents based on the provided Object IDs as array.
	 * @returns The current instance of QueryBuilder.
	 */
	getDocumentsByIds() {
		let ids: string[] = [];

		if (typeof this?.query?.ids === 'string') {
			ids = [this?.query?.ids];
		} else if (Array.isArray(this?.query?.ids)) {
			ids = this?.query?.ids as string[];
		}

		if (ids.length > 0) {
			this.modelQuery = this.modelQuery.find({ _id: { $in: ids } });
		}

		return this;
	}

	/**
	 * Method to paginate the query based on `page` and `limit` from the query object.
	 * @returns The current instance of QueryBuilder.
	 */
	paginate() {
		const page = Number(this?.query?.page) || 1;
		const limit = Number(this?.query?.limit) || 10;
		const skip = (page - 1) * limit;

		this.modelQuery = this.modelQuery.skip(skip).limit(limit);

		return this;
	}

	/**
	 * Method to exclude field(s) from the document(s).
	 * @param fixedFields An array of fields to always exclude from the document(s).
	 * @returns The current instance of QueryBuilder.
	 */
	excludeFields(fixedFields?: ExcludeField<T>[]) {
		const fields: string[] = ['-__v'];

		if (fixedFields && fixedFields.length > 0) {
			fixedFields.forEach((field) => fields.push(field));
		}

		if (typeof this?.query?.exclude === 'string') {
			fields.push(this?.query?.exclude);
		} else if (Array.isArray(this?.query?.exclude)) {
			(this?.query?.exclude as string[]).forEach((field) => fields.push(field));
		}

		this.modelQuery = this.modelQuery.select([...new Set(fields)].join(' '));

		return this;
	}
}
