
import { Answer } from "./answer";
import { PairAnswer } from "./pairanswer";
import { GenderedAnswers } from "./genderedanswers";
import { Question } from "./question";
import { Person } from "./person";
import { User } from "./user";
import { Attribute } from "./attribute";
import { ProfileField } from "./profilefield";
import { Picture } from "./picture";
import { Quote } from "./quote";
import { QuotePart } from "./quotepart";

Person.hasOne(User, { foreignKey: "personId" });
User.belongsTo(Person, { foreignKey: "personId" });

User.hasMany(Answer, { foreignKey: "answerPossibilityId" });
Answer.belongsTo(User, { foreignKey: "answerPossibilityId" });

User.hasMany(PairAnswer, { foreignKey: "answerOneId", as: "answerOneMany" });
PairAnswer.belongsTo(User, { foreignKey: "answerOneId", as: "answerOneOne" });

User.hasMany(PairAnswer, { foreignKey: "answerTwoId", as: "answerTwoMany" });
PairAnswer.belongsTo(User, { foreignKey: "answerTwoId", as: "answerTwoOne" });

Question.hasOne(Answer, { foreignKey: "questionId" });
Answer.belongsTo(Question, { foreignKey: "questionId" });

Question.hasOne(PairAnswer, { foreignKey: "questionId" });
PairAnswer.belongsTo(Question, { foreignKey: "questionId" });

Question.hasOne(GenderedAnswers, { foreignKey: "questionId" });
GenderedAnswers.belongsTo(Question, { foreignKey: "questionId" });

User.hasOne(Answer, { foreignKey: "userId" });
Answer.belongsTo(User, { foreignKey: "userId" });

User.hasOne(PairAnswer, { foreignKey: "userId" });
PairAnswer.belongsTo(User, { foreignKey: "userId" });

User.hasOne(GenderedAnswers, { foreignKey: "userId" });
GenderedAnswers.belongsTo(User, { foreignKey: "userId" });

ProfileField.hasOne(Attribute, { foreignKey: "profileFieldId" });
Attribute.belongsTo(ProfileField, { foreignKey: "profileFieldId" });

User.hasOne(Attribute, { foreignKey: "userId" });
Attribute.belongsTo(User, { foreignKey: "userId" });

User.hasOne(Attribute, { foreignKey: "editId" });
Attribute.belongsTo(User, { foreignKey: "editId" });

User.hasOne(Picture, { foreignKey: "userId" });
Picture.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Quote, { foreignKey: "userId" });
Quote.belongsTo(User, { foreignKey: "userId" });

Quote.hasMany(QuotePart, { foreignKey: "quoteId" });
QuotePart.belongsTo(Quote, { foreignKey: "quoteId" });

User.hasMany(QuotePart, { foreignKey: "answerPossibilityId" });
QuotePart.belongsTo(User, { foreignKey: "answerPossibilityId" });

export class X {
	log() {
		// eslint-disable-next-line no-console
		console.log("Associations loaded");
	}
}
