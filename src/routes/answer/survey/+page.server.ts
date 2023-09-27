import { Question } from "$lib/server/models/question";
import type { PageServerLoad } from "./$types";
import { User } from "$lib/server/models/user";
import { Person } from "$lib/server/models/person";
import { Answer } from "$lib/server/models/answer";
import type { Actions } from "@sveltejs/kit";
import { PairAnswer } from "$lib/server/models/pairanswer";
import { GenderedAnswers } from "$lib/server/models/genderedanswers";
import { compare_nums } from "$lib/server/utilities";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ locals }) => {
	const possibilities = (
		await User.findAll({
			include: Person,
			attributes: ["id", "isTeacher", "personId", "gender", "Person.forename", "Person.surname"],
		})
	).map((value) => {
		return value.dataValues;
	});

	return {
		possibilities: possibilities.map((row) => {
			return {
				id: row.id,
				isTeacher: row.isTeacher,
				personId: row.personId,
				gender: row.gender,
				// @ts-ignore
				forename: row.Person.forename,
				// @ts-ignore
				surname: row.Person.surname,
			};
		}),
		questions: (
			await Question.findAll({
				attributes: ["id", "question", "teacherQuestion", "genderedQuestion", "pair"],
				order: [["question", "ASC"]],
			})
		).map((question) => {
			return question.dataValues;
		}),
		answers: (
			await Answer.findAll({
				attributes: ["id", "questionId", "answerPossibilityId"],
				where: {
					userId: locals.userId,
				},
			})
		).map((answer) => {
			return answer.dataValues;
		}),
		genderedanswers: (
			await GenderedAnswers.findAll({
				attributes: ["id", "questionId", "answerMaleId", "answerFemaleId"],
				where: {
					userId: locals.userId,
				},
			})
		).map((answer) => {
			return answer.dataValues;
		}),
		pairanswers: (
			await PairAnswer.findAll({
				attributes: ["id", "questionId", "answerOneId", "answerTwoId"],
				where: {
					userId: locals.userId,
				},
			})
		).map((answer) => {
			return answer.dataValues;
		}),
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const data = await request.formData();

		let current_question: number | undefined;
		let current_answer: number | undefined;
		let current_possibility: number | undefined;
		let current_possibility_two: number | undefined;

		async function processEntry() {
			if (current_possibility === undefined) {
				return;
			}

			const question = await Question.findOne({ where: { id: current_question } });

			if (question !== null && !question.pair && !question.genderedQuestion) {
				if (current_answer === undefined) {
					await Answer.create({
						questionId: current_question,
						answerPossibilityId: current_possibility,
						userId: locals.userId,
					});
				} else {
					await Answer.update(
						{ answerPossibilityId: current_possibility },
						{ where: { id: current_answer, userId: locals.userId } },
					);
				}
			} else if (question !== null && !question.genderedQuestion) {
				const order = compare_nums(current_possibility, current_possibility_two)
					? {
						answerOneId: current_possibility,
						answerTwoId: current_possibility_two,
					}
					: {
						answerOneId: current_possibility_two,
						answerTwoId: current_possibility,
					};

				if (current_answer === undefined) {
					if (current_possibility === current_possibility_two) {
						return;
					}

					await PairAnswer.create(
						Object.assign(
							{
								questionId: current_question,
								userId: locals.userId,
							},
							order,
						),
					);
				} else {
					await PairAnswer.update(order, {
						where: { id: current_answer, userId: locals.userId },
					});
				}
			} else {

				const order = {
						answerMaleId: current_possibility,
						answerFemaleId: current_possibility_two,
					}
					

				if (current_answer === undefined) {
					if (current_possibility === current_possibility_two) {
						return;
					}

					await GenderedAnswers.create({
						answerMaleId: current_possibility,
						answerFemaleId: current_possibility_two,
						questionId: current_question,
						userId: locals.userId,
					});
				
				} else {
					await GenderedAnswers.update(order, {
						where: { id: current_answer, userId: locals.userId },
					});
				}

            }
		}
		
		for (const pair of data.entries()) {
			const key = pair[0];
			const value = pair[1];

			if (key === "questionId") {
				
				current_question = parseInt(value.toString());
				await processEntry();
				current_answer = undefined;
				current_possibility = undefined;
				current_possibility_two = undefined;
			} else if (key === "answerId") {
				current_answer = parseInt(value.toString());
			} else if (key === "answerPossibilityId" || key === "answerOneId" || key === "answerMaleId") {
				current_possibility = parseInt(value.toString());
			} else if (key === "answerTwoId" || key === "answerFemaleId") {
				current_possibility_two = parseInt(value.toString());
				
			}

		}

		

	},
};
