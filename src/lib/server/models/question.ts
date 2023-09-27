import { Model, DataTypes } from "sequelize";
import type { InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import { db } from "../database";

export class Question extends Model<InferAttributes<Question>, InferCreationAttributes<Question>> {
	declare id: CreationOptional<number>;
	declare question: string;
	declare pair: boolean;
	declare teacherQuestion: boolean;
	declare genderedQuestion: boolean;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
}

Question.init(
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		question: DataTypes.STRING,
		pair: DataTypes.BOOLEAN,
		teacherQuestion: DataTypes.BOOLEAN,
		genderedQuestion: DataTypes.BOOLEAN,
		createdAt: DataTypes.DATE,
		updatedAt: DataTypes.DATE,
	},
	{
		sequelize: db,
		tableName: "questions",
	},
);
