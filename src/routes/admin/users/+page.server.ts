import type { PageServerLoad } from "./$types";
import type { Actions } from "@sveltejs/kit";
import { randomBytes } from "crypto";
import { User } from "$lib/server/models/user";
import { AnswerPossibility } from "$lib/server/models/answerpossibility";
import { Person } from "$lib/server/models/person";
import { Answer } from "$lib/server/models/answer";
import { PairAnswer } from "$lib/server/models/pairanswer";
import { GenderedAnswers } from "$lib/server/models/genderedanswers";
import { Quote } from "$lib/server/models/quote";
import { QuotePart } from "$lib/server/models/quotepart";

import { check_delete_person } from "$lib/server/utilities";

interface inPerson {
	id?: number;
	forename: string;
	surname: string;
}

interface inUser {
	id?: number;
	mail?: string;
	gender?: "m" | "w" | "d";
	code: string;
	isTeacher?: boolean;
	personId?: number;
}

interface fetchedUser {
	id: number;
	personId: number;
}

export const load: PageServerLoad = async ({ url }) => {
	const data = (
		await User.findAll({
			include: Person,
			attributes: ["id", "mail", "gender", "code", "personId", "Person.forename", "Person.surname", "isTeacher"],
			where: { isTeacher: false }
		})
	).map((value) => {
		return value.dataValues;
	});

	return {
		users: data.map((row) => {
			return {
				id: row.id,
				mail: row.mail,
				gender: row.gender,
				code: row.code,
				personId: row.personId,
				isTeacher: row.isTeacher,
				// @ts-ignore
				forename: row.Person.forename,
				// @ts-ignore
				surname: row.Person.surname,
			};
		}),
		origin: url.origin,
	};
};

export const actions: Actions = {
	users: async ({ request }) => {
		// fetch user ids to check what needs to be deleted later
		const db_users: Array<fetchedUser> = (
			await User.findAll({
				include: Person,
				attributes: ["id", "mail", "gender", "code", "personId", "Person.forename", "Person.surname", "isTeacher"],
				where: {isTeacher: false}
			})
		).map((user) => {
			return user.dataValues;
		});

		const data = await request.formData();

		const processed: Array<number> = [];

		let current_user: inUser = {
			id: undefined,
			code: "",
			mail: "",
			gender: "m",
			isTeacher: false
		};

		let current_person: inPerson = {
			id: undefined,
			forename: "",
			surname: "",
		};

		async function processEntry() {
			if (current_person.forename !== "") {
				let person;
				if (current_person.id === undefined) {
					person = await Person.create(current_person);
				} else {
					await Person.update(current_person, { where: { id: current_person.id } });
					person = current_person;
				}

				// @ts-ignore
				current_user.personId = person.id;

				if (current_user.id === undefined) {
					current_user.isTeacher = false;
					await User.create(current_user);
				} else {
					await User.update(current_user, {
						where: {
							id: current_user.id,
						},
					});
					processed.push(current_user.id);
				}
			}
		}

		for (const pair of data.entries()) {
			const key = pair[0];
			const value = pair[1];

			if (key === "forename") {
				await processEntry();

				current_user = {
					id: undefined,
					code: "",
				};


				current_person = {
					id: undefined,
					forename: "",
					surname: "",
				};

				current_person.forename = value.toString();
			} else if (key === "surname") {
				current_person.surname = value.toString();
			} else if (key === "id") {
				current_user.id = parseInt(value.toString());
			} else if (key === "personId") {
				current_person.id = parseInt(value.toString());
			} else if (key === "code") {
				let code = value.toString();
				if (code == "---") {
					code = randomBytes(4).toString("hex").toUpperCase();
				}
				current_user.code = code;
			} else if (key === "mail") {
				current_user.mail = value.toString();
			} else if (key === "gender") {
				current_user.gender = value;
			} else if (key === "isTeacher") {
				current_user.isTeacher = value.toString() === "true";
            }
		}

		

		await processEntry();

		for (const { id, personId } of db_users) {
			if (!processed.includes(id)) {
				await Answer.destroy({ where: { userId: id } });
				await PairAnswer.destroy({ where: { userId: id } });
				await GenderedAnswers.destroy({ where: { userId: id } });

				const belongingQuotes = (
					await Quote.findAll({ where: { userId: id }, attributes: ["id"] })
				).map((quote) => {
					return quote.id;
				});
				await QuotePart.destroy({ where: { quoteId: belongingQuotes } });
				await Quote.destroy({ where: { userId: id } });

				await User.destroy({ where: { id: id } });

				await check_delete_person(personId);
			}
		}
	},
	generate: async () => {
		const possibilities = (
			await AnswerPossibility.findAll({
				include: Person,
				attributes: ["id", "personId"],
				where: {
					isTeacher: false,
				},
			})
		).map((value) => {
			return value.dataValues;
		});

		for (const possibility of possibilities) {
			await User.findOrCreate({
				where: { personId: possibility.personId },
				defaults: {
					code: randomBytes(4).toString("hex").toUpperCase(),
				},
			});
		}
	},
};
