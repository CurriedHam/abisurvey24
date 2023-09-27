import { Model, DataTypes } from "sequelize";
import type { InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import { db } from "../database";

export class ProfileField extends Model<
	InferAttributes<ProfileField>,
	InferCreationAttributes<ProfileField>
> {
	declare id: CreationOptional<number>;
	declare field: string;
	declare friendQuestion: boolean;
	declare forTeacher: boolean;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
}

ProfileField.init(
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		field: DataTypes.STRING,
		friendQuestion: DataTypes.BOOLEAN,
		forTeacher: DataTypes.BOOLEAN,
		createdAt: DataTypes.DATE,
		updatedAt: DataTypes.DATE,
	},
	{
		sequelize: db,
		tableName: "profilefields",
	},
);
