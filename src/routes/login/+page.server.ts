import type { Actions } from "@sveltejs/kit";

import { User } from "$lib/server/models/user";
import { SignJWT } from "jose";
import { dev } from "$app/environment";

import { env } from "$env/dynamic/private";
const { SECRET } = env;
import { error, redirect } from "@sveltejs/kit";

const jwt_alg = "HS256";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const secret = new TextEncoder().encode(SECRET);

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();

		let email = data.get("email");
		const code = data.get("code");

		if (email === null || code == null) {
			throw error(404, "incomplete request");
		}

		email = email.toString().toLowerCase();

		const user = await User.findOne({
			attributes: ["mail", "gender", "id", "code", "isTeacher"],
			where: { mail: email },
		});

		if (user === null || user.dataValues.code !== code) {
			throw error(401, "wrong code");
		}

		const jwt = await new SignJWT({ userId: user.dataValues.id })
			.setProtectedHeader({ alg: jwt_alg })
			.setExpirationTime("1d")
			.sign(secret);

		cookies.set("usersession", jwt.toString(), {
			path: "/",
			sameSite: "strict",
			secure: !dev,
			maxAge: 60 * 60 * 24,
		});

		if (user.gender === null) {
			throw redirect(302, "/register");
		} else {
			if (user.isTeacher) {
				throw redirect(302, "/teacher/quotes");
			} else {
				throw redirect(302, "/");
            }
			
        }
		
	},
};
