import { GraphQLError } from "graphql";
import { getCompany } from "./db/companies.js";
import {
	createJob,
	deleteJob,
	getJob,
	getJobs,
	getJobsByCompany,
	updateJob,
} from "./db/jobs.js";

export const resolvers = {
	Query: {
		company: async (_root, { id }) => {
			const company = await getCompany(id);
			if (!company) {
				throw notFoundError("No Company found with id " + id);
			}
			return company;
		},
		job: async (_root, { id }) => {
			const job = await getJob(id);
			if (!job) {
				throw notFoundError("No Job found with id " + id);
			}
			return job;
		},
		jobs: () => getJobs(),
	},

	Mutation: {
		createJob: async (_root, { input: { title, description } }, { user }) => {
			if (!user) {
				throw unauthorizedError("Missing Authentication");
			}
			return await createJob({ companyId: user.companyId, title, description });
		},
		updateJob: async (
			_root,
			{ input: { id, title, description } },
			{ user }
		) => {
			if (!user) {
				throw unauthorizedError("Missing Authentication");
			}
			const job = await updateJob({
				id,
				companyId: user.companyId,
				title,
				description,
			});
			if (!job) {
				throw notFoundError("No Job found with id " + id);
			}
			return job;
		},
		deleteJob: async (_root, { id }, { user }) => {
			if (!user) {
				throw unauthorizedError("Missing Authentication");
			}
			const job = await deleteJob(id, user.companyId);
			if (!job) {
				throw notFoundError("No Job found with id " + id);
			}
			return job;
		},
	},

	Company: {
		jobs: (company) => getJobsByCompany(company.id),
	},

	Job: {
		date: (job) => toISOString(job.createdAt),
		company: (job) => getCompany(job.companyId),
	},
};

const notFoundError = (message) =>
	new GraphQLError(message, {
		extensions: { code: "NOT_FOUND" },
	});

const unauthorizedError = (message) =>
	new GraphQLError(message, {
		extensions: { code: "UNAUTHORIZED" },
	});

const toISOString = (value) => value.slice(0, "yyyy-mm-dd".length);
