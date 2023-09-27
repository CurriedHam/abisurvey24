import { Model, DataTypes } from "sequelize";
import type {
	InferAttributes,
	InferCreationAttributes,
	CreationOptional,
	ForeignKey,
} from "sequelize";
import { db } from "../database";
import type { Question } from "./question";
import type { AnswerPossibility } from "./answerpossibility";
import type { User } from "./user";

export class GenderedAnswers extends Model<
	InferAttributes<GenderedAnswers>,
	InferCreationAttributes<GenderedAnswers>
> {
	declare id: CreationOptional<number>;
	declare userId: ForeignKey<User["id"]>;
	declare questionId: ForeignKey<Question["id"]>;
	declare answerMaleId: ForeignKey<User["id"]>;
	declare answerFemaleId: ForeignKey<User["id"]>;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
}

GenderedAnswers.init(
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		userId: DataTypes.INTEGER,
		questionId: DataTypes.INTEGER,
		answerMaleId: DataTypes.INTEGER,
		answerFemaleId: DataTypes.INTEGER,
		createdAt: DataTypes.DATE,
		updatedAt: DataTypes.DATE,
	},
	{
		sequelize: db,
		tableName: "genderedanswers",
	},
);
