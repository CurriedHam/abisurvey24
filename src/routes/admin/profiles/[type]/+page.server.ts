import type { PageServerLoad } from "./$types";
import type { Actions } from "./$types";
import { ProfileField } from "$lib/server/models/profilefield";
import { Setting } from "$lib/server/models/setting";
import { error } from "@sveltejs/kit";

interface inField {
	id?: number;
	field: string;
	friendQuestion: boolean;
	forTeacher: boolean;
}

export const load: PageServerLoad = async ({params }) => {
	return {
		type: params.type,
		fields: (
			await ProfileField.findAll({
				attributes: ["id", "friendQuestion", "field"],
				where: {forTeacher: params.type === "teacher"},
			})
		).map((field) => {
			return field.dataValues;
		}),
		picture_count: parseInt(
			(
				await Setting.findOrCreate({
					where: { key: "PICTURE_COUNT" },
					defaults: { key: "PICTURE_COUNT", value: "0" },
					attributes: ["value"],
				})
			)[0].value,
		),
	};
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		// fetch question ids to check what needs to be deleted later
		const field_ids = (
			await ProfileField.findAll({
				attributes: ["id"],
			})
		).map((field) => {
			return field.dataValues.id;
		});

		const keep_ids = (
			await ProfileField.findAll({
				attributes: ["id"],
				where: {forTeacher: params.type != "teacher"},
			})
		).map((field) => {
			return field.dataValues.id;
		});

		const data = await request.formData();

		const result: Array<inField> = [];
		let current: inField = {
			field: "",
			friendQuestion: false,
			forTeacher: params.type === "teacher",
		};
		
		for (const pair of data.entries()) {
			const key = pair[0];
			const value = pair[1];
			console.log(key);

			if (key === "field") {
				if (current.field !== "") {
					result.push(current);
				}

				current = {
					field: "",
					friendQuestion: false,
					forTeacher: params.type === "teacher",
				};

				current.field = value.toString();
			} else if (key === "id") {
				current.id = parseInt(value.toString());
			} else if (key == "friendQuestion") {
				current.friendQuestion = true;
            }
		}

		if (current.field !== "") {
			result.push(current);
		}

		const with_id: Array<inField> = [];
		const without_id: Array<inField> = [];

		const in_ids: Array<number> = [];

		result.forEach((field) => {
			if (Object.hasOwn(field, "id") && field.id != undefined) {
				with_id.push(field);
				in_ids.push(field.id);
			} else {
				without_id.push(field);
			}
		});

		await ProfileField.bulkCreate(without_id);

		for (let i = 0; i < with_id.length; i++) {
			const field = with_id[i];
			await ProfileField.update(field, { where: { id: field.id } });
		}

		const removables: Array<number> = [];

		field_ids.forEach((number) => {
			if (!in_ids.includes(number) && !keep_ids.includes(number)) {
				removables.push(number);
			}
		});

		await ProfileField.destroy({ where: { id: removables } });
	},
	count: async ({ request }) => {
		const data = await request.formData();

		const count = data.get("count");

		if (count === null || count === undefined) {
			throw error(400, { message: "Missing 'count' attribute" });
		}

		await (
			await Setting.findOrCreate({
				where: { key: "PICTURE_COUNT" },
				defaults: { key: "PICTURE_COUNT", value: "0" },
				attributes: ["id", "value"],
			})
		)[0]
			.set("value", count.toString())
			.save();
	},
};
