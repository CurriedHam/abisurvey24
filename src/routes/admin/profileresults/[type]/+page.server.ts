import type { PageServerLoad } from "./$types";

import { Picture } from "$lib/server/models/picture";
import { User } from "$lib/server/models/user";
import { Attribute } from "$lib/server/models/attribute";
import { ProfileField } from "$lib/server/models/profilefield";
import { Person } from "$lib/server/models/person";

export const load: PageServerLoad = async ({params}) => {
	console.log("1");
	return {
		users: (
			await User.findAll({
				include: Person,
				attributes: ["id", "Person.forename", "Person.surname"],
				where: {isTeacher: params.type == "teacher"}
			})
		).map((user) => {
			return {
				id: user.id,
				name: `${user.Person.forename} ${user.Person.surname}`,
            };
		}),
		attributes: (
			await Attribute.findAll({
				attributes: ["answer", "userId", "editId", "profileFieldId"],
				order: [["profileFieldId", "ASC"]],
			})
		).map((attribute) => {
			return {
				answer: attribute.answer,
				userId: attribute.userId,
				editId: attribute.editId,
				profileFieldId: attribute.profileFieldId,
			};
		}),
		fields: (
			await ProfileField.findAll({ attributes: ["id", "field"], order: [["id", "ASC"]], where: {forTeacher: params.type == "teacher"} })
		).map((field) => {
			return {
				id: field.id,
				field: field.field,
			};
		}),
		pictures: (await Picture.findAll({ attributes: ["userId", "id"] })).map((picture) => {
			const data = picture.dataValues;
			return {
				image: `/admin/images/${data.id}`,
				userId: data.userId,
			};
		}),
	};
};
