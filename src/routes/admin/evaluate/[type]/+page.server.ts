import type { PageServerLoad } from "./$types";
import { Answer } from "$lib/server/models/answer";
import { db } from "$lib/server/database";
import { User } from "$lib/server/models/user";
import { Person } from "$lib/server/models/person";
import { Question } from "$lib/server/models/question";
import { PairAnswer } from "$lib/server/models/pairanswer";
import { GenderedAnswers } from "$lib/server/models/genderedanswers";

import { Op } from "sequelize";

interface QueriedPossibility {
	id: number;
	gender: string;
	Person: Person;
}

interface QueriedAnswer {
	id: number;
	questionId: number;
	answerPossibilityId: number;
	count: string;
	Question: Question;
}

interface QueriedGenderedAnswer {
	id: number;
	questionId: number;
	answerId: number;
	count: string;
	Question: Question;
}

interface QueriedPairAnswer {
	id: number;
	questionId: number;
	answerOneId: number;
	answerTwoId: number;
	count: string;
	Question: Question;
}


export const load: PageServerLoad = async ({ params }) => {
	// @ts-ignore
	const possibilities: Array<QueriedPossibility> = (
		await User.findAll({
			include: Person,
			attributes: ["id", "gender", "Person.forename", "Person.surname"],
			where: {
				isTeacher: params.type === "teacher",
			},
		})
	).map((value) => {
		return value.dataValues;
	});

	// @ts-ignore
	const answers: Array<QueriedAnswer> = (
		await Answer.findAll({
			include: [
				{
					model: Question,
					attributes: ["teacherQuestion"],
					where: { teacherQuestion: params.type === "teacher" },
				},
			],
			attributes: [
				"questionId",
				"answerPossibilityId",
				[db.fn("count", "answerPossibilityId"), "count"],
			],
			group: ["questionId", "answerPossibilityId", "Question.id"],
		})
	).map((row) => {
		return row.dataValues;
	});

	// @ts-ignore
	const maleanswers: Array<QueriedGenderedAnswer> = (
		await GenderedAnswers.findAll({
			include: [
				{
					model: Question,
					attributes: ["teacherQuestion"],
					where: { teacherQuestion: params.type === "teacher" },
				},
			],
			attributes: [
				"questionId",
				["answerMaleId","answerId"],
				[db.fn("count", "answerMaleId"), "count"],
			],
			where: {
				answerMaleId: {
					[Op.not]: null,
				},
				answerFemaleId: {
					[Op.not]: null,
				},
			},
			group: ["questionId", "answerMaleId", "Question.id"],
		})
	).map((row) => {
		return row.dataValues;
	});

	// @ts-ignore
	const femaleanswers: Array<QueriedGenderedAnswer> = (
		await GenderedAnswers.findAll({
			include: [
				{
					model: Question,
					attributes: ["teacherQuestion"],
					where: { teacherQuestion: params.type === "teacher" },
				},
			],
			attributes: [
				"questionId",
				["answerFemaleId","answerId"],
				[db.fn("count", "answerFemaleId"), "count"],
			],
			where: {
				answerMaleId: {
					[Op.not]: null,
				},
				answerFemaleId: {
					[Op.not]: null,
				},
			},
			group: ["questionId", "answerFemaleId", "Question.id"],
		})
	).map((row) => {
		return row.dataValues;
	});

	// @ts-ignore
	const pairanswers: Array<QueriedPairAnswer> = (
		await PairAnswer.findAll({
			include: [
				{
					model: Question,
					attributes: ["teacherQuestion"],
					where: { teacherQuestion: params.type === "teacher" },
				},
			],
			attributes: [
				"questionId",
				"answerOneId",
				"answerTwoId",
				[db.fn("count", "answerOneId"), "count"],
			],
			where: {
				answerOneId: {
					[Op.not]: null,
				},
				answerTwoId: {
					[Op.not]: null,
				},
			},
			group: ["questionId", "answerOneId", "answerTwoId", "Question.id"],
		})
	).map((row) => {
		return row.dataValues;
	});

	

	return {
		answers: answers.map((answer) => {
			return {
				questionId: answer.questionId,
				answerPossibilityId: answer.answerPossibilityId,
				count: answer.count,
			};
		}),
		pairanswers: pairanswers.map((pairanswer) => {
			return {
				questionId: pairanswer.questionId,
				answerOneId: pairanswer.answerOneId,
				answerTwoId: pairanswer.answerTwoId,
				count: pairanswer.count,
			};
		}),
		maleanswers: maleanswers.map((genderedanswer) => {
			return {
				questionId: genderedanswer.questionId,
				answerId: genderedanswer.answerId,
				count: genderedanswer.count,
			};
		}),
		femaleanswers: femaleanswers.map((genderedanswer) => {
			return {
				questionId: genderedanswer.questionId,
				answerId: genderedanswer.answerId,
				count: genderedanswer.count,
			};
		}),
		questions: (
			await Question.findAll({
				attributes: ["id", "question", "teacherQuestion"],
				where: {
					teacherQuestion: params.type === "teacher",
				},
			})
		).map((question) => {
			return question.dataValues;
		}),

		possibilities: possibilities.map((row) => {
			return {
				id: row.id,
				gender: row.gender,
				forename: row.Person.forename,
				surname: row.Person.surname,
			};
		}),
		type: params.type,
	};
};
