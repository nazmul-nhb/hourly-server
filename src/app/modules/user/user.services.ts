import { QueryBuilder } from '../../classes/QueryBuilder';
import { User } from './user.model';

const getAllUsersFromDB = async (query?: Record<string, unknown>) => {
	const userQuery = new QueryBuilder(User.find(), query).sort();
	// const users = await User.find({});

	const users = await userQuery.modelQuery;

	return users;
};

export const userServices = { getAllUsersFromDB };
