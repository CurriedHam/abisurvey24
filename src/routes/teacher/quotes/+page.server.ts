import type { PageServerLoad } from "./$types";
import type { Actions } from "@sveltejs/kit";
import { User } from "$lib/server/models/user";
import { Person } from "$lib/server/models/person";
import { Quote } from "$lib/server/models/quote";
import { QuotePart } from "$lib/server/models/quotepart";

interface inQuote {
	id?: number;
	allowed?: boolean;
}

interface fetchedQuote {
	id: number;
}

export const load: PageServerLoad = (async ({ locals }) => {
	const possibilities = (
		await User.findAll({
			include: Person,
			attributes: ["id", "isTeacher", "personId", "Person.forename", "Person.surname",],
		})
	).map((value) => {
		return value.dataValues;
	});

	const quotes = await Quote.findAll({
		include: [
			{
				model: QuotePart,
				attributes: ["answerPossibilityId", "content", "id"],
				separate: true,
				order: [["id", "ASC"]],
				where: { answerPossibilityId: locals.userId },
			},
			{
				model: User,
				attributes: ["personId"],
				include: [
					{
						model: Person,
						attributes: ["forename", "surname"],
					},
				],
			},
		],
		attributes: ["id", "course", "allowed"],
		order: [["userId", "ASC"]],
		
	});

	return {
		possibilities: possibilities.map((row) => {
			return {
				id: row.id,
				isTeacher: row.isTeacher,
				personId: row.personId,
				// @ts-ignore
				forename: row.Person.forename,
				// @ts-ignore
				surname: row.Person.surname,
			};
		}),
		quotes: quotes.map((quote) => {
			const person = quote.User.Person;

			return {
				user: `${person.forename} ${person.surname}`,
				course: quote.course,
				id: quote.id,
				allowed: quote.allowed,
				parts: quote.QuoteParts.map((part) => {
					return {
						id: part.id,
						answerPossibilityId: part.answerPossibilityId,
						content: part.content,
					};
				}),
			};
		}),
	};
})

export const actions: Actions = {
	quotes: async ({ request }) => {
		// fetch user ids to check what needs to be deleted later
		const db_quote: Array<fetchedQuote> = (
			await Quote.findAll({
				attributes: ["id", "allowed"],
			})
		).map((quote) => {
			return quote.dataValues;
		});

		const data = await request.formData();

		const processed: Array<number> = [];

		let current_quote: inQuote = {
			id: undefined,
			allowed: undefined,
		};

		async function processEntry() {

				if (current_quote.id === undefined) {

				} else {
					await Quote.update(current_quote, {
						where: {
							id: current_quote.id,
						},
					});
					processed.push(current_quote.id);
				}
		}

		for (const pair of data.entries()) {
			const key = pair[0];
			const value = pair[1];

			if (key === "id") {
				current_quote.id = parseInt(value.toString());
			} else if (key === "allowed") {
				current_quote.allowed = value.toString() === "true";
			}
		}

		await processEntry();

	},
} satisfies PageServerLoad;
