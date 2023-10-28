import { env } from "$env/dynamic/private";
const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = env;

import { Sequelize } from "sequelize";

function connectDB() {
	return new Sequelize(`postgres://${"abisurvey"}:${"abisurvey"}@${"host.docker.internal"}:${5432}/${"abisurvey"}`);
}

export const db = connectDB();
