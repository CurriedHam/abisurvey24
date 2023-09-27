import type { Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { User } from "$lib/server/models/user";
import { error, redirect } from "@sveltejs/kit";
import { SignJWT } from "jose";
import { dev } from "$app/environment";

import { env } from "$env/dynamic/private";
const { SECRET } = env;

import { validateGender } from "$lib/client/utils";

const jwt_alg = "HS256";
// @ts-ignore
const secret = new TextEncoder().encode(SECRET);

export const actions: Actions = {
	default: async ({ request, cookies, locals }) => {
		const data = await request.formData();

		const user = await User.findOne({
			attributes: ["code","mail"],
			where: { id: locals.userId }
		});
		//const code = data.get("code");
		const gender = data.get("gender");
		const accept_privacy = data.get("accept_privacy");

		if (user === null || user.code === null || gender === null || accept_privacy === null) {
			throw error(400, "incomplete request");
		}

		if (accept_privacy !== "on") {
			throw error(400, "you have to accept the privacy policy");
		}

		const gender_str = gender.toString();

		if (!validateGender(gender_str)) {
			throw error(400, "incorrect gender input");
		}

		if (user === null) {
			throw error(401, "wrong code");
		}

		const newUser = {
			mail: user.mail,
			gender: gender_str,
			code: user.code
		};

		await User.update(newUser, { where: { id: locals.userId } });
		throw redirect(302, "/");
	},
};
