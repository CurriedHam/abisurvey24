<script lang="ts">
	import { onMount } from "svelte";

	import { scale } from "svelte/transition";

	import { edited, actionCall } from "$lib/client/stores/refresh";

	import { order_possiblities } from "$lib/client/utils";

	interface Possibility {
		forename: string;
		surname: string;
		gender: string;
		id: number;
		isTeacher: boolean;
		personId: number;
	}

	interface Answer {
		id?: number;
		answerPossibilityId: number;
	}

	interface PairAnswer {
		id?: number;
		answerOneId?: number;
		answerTwoId?: number;
	}

	interface GenderedAnswer {
		id?: number;
		answerMaleId?: number;
		answerFemaleId?: number;
	}

	interface Question {
		id: number;
		question: string;
		teacherQuestion: boolean;
		genderedQuestion: boolean;
		pair: boolean;
	}

	export let data;

	// variables to track the currently edited field
	let current: number;
	let pair_part: number;

	let studentQuestions: Array<Question> = [];
	let teacherQuestions: Array<Question> = [];

	// variable to have all questions
	$: questions = studentQuestions.concat(teacherQuestions);

	const calc_answered_pairs = (obj: Record<string, PairAnswer>) => {
		const keys = Object.keys(obj);

		let res = 0.0;

		keys.forEach((k) => {
			const keys = Object.keys(obj[k]);

			let key_length = keys.length;

			if (keys.includes("id")) {
				key_length -= 1;
			}

			res += key_length / 2;
		});

		return res;
	};

	const calc_answered_gendered = (obj: Record<string, GenderedAnswer>) => {
		const keys = Object.keys(obj);

		let res = 0.0;

		keys.forEach((k) => {
			const keys = Object.keys(obj[k]);

			let key_length = keys.length;

			if (keys.includes("id")) {
				key_length -= 1;
			}

			res += key_length / 2;
		});

		return res;
	};

	$: answered_num = Object.keys(answers).length + calc_answered_pairs(pairanswers) + calc_answered_gendered(genderedanswers);

	let teacherPossibilities: Array<Possibility> = [];
	let studentPossibilities: Array<Possibility> = [];

	// easy access to full possibility names
	let possibilities = {};

	// objects with answers; question ids as keys
	let answers: Record<string, Answer> = {};
	let pairanswers: Record<string, PairAnswer> = {};
	let genderedanswers: Record<string, GenderedAnswer> = {};

	onMount(() => {
		// preprocess the data provided by the backend
		data.questions.forEach((question) => {
			if (question.teacherQuestion) {
				teacherQuestions.push(question);
			} else {
				studentQuestions.push(question);
			}
		});

		data.possibilities.forEach((possibility) => {
			if (possibility.isTeacher) {
				teacherPossibilities.push(possibility);
			} else {
				studentPossibilities.push(possibility);
			}

			possibilities[possibility.id] = `${possibility.forename} ${possibility.surname}`;
		});

		data.answers.forEach((answer) => {
			answers[answer.questionId] = {
				id: answer.id,
				answerPossibilityId: answer.answerPossibilityId,
			};
		});

		data.pairanswers.forEach((answer) => {
			pairanswers[answer.questionId] = {
				id: answer.id,
				answerOneId: answer.answerOneId,
				answerTwoId: answer.answerTwoId,
			};
		});

		data.genderedanswers.forEach((answer: { questionId: number; id: number; answerMaleId: number; answerFemaleId: number; }) => {
			genderedanswers[answer.questionId] = {
				id: answer.id,
				answerMaleId: answer.answerMaleId,
				answerFemaleId: answer.answerFemaleId,
			};
		});

		// refresh state
		studentQuestions = [...studentQuestions];
		teacherQuestions = [...teacherQuestions];
	});

	let searchResults: Array<Possibility> = [];

	let isClicked = 0;

	function search(term: string, teacher: boolean, questionId: number, gender: string) {

		if(gender == "n"){
			edited.set(true);

			// Calculates the order of the possibilities using the levenshtein distance
			let searchables: Array<Possibility>;

			if (teacher) {
				searchables = [...teacherPossibilities];
			} else {
				searchables = [...studentPossibilities];
			}

			let given_answers = pairanswers[questionId];

			if (given_answers) {
				["answerOneId", "answerTwoId"].forEach((part) => {
					const answer = given_answers[part];

					if (answer) {
						const index = searchables
							.map((s) => {
								return s.id;
							})
							.indexOf(answer);

						searchables.splice(index, 1);
					}
				});
			}

			searchResults = order_possiblities(term, searchables).slice(0, 4);
		}else{
			edited.set(true);

			// Calculates the order of the possibilities using the levenshtein distance
			let searchables: Array<Possibility>;

			if (teacher) {
				searchables = [...teacherPossibilities];
			} else {
				searchables = [...studentPossibilities];
			}

			let given_answers = genderedanswers[questionId];
			let right_gender: Array<Possibility> = [];

			searchables.forEach((pos) => {

				if (pos.gender == gender) {

					right_gender.push(pos)
				}
			});

			searchResults = order_possiblities(term, right_gender).slice(0, 4);
		}
		
	}

	function getAnswerForId(obj: Record<string, Answer>, id: number): string {
		if (id.toString() in obj) {
			return possibilities[obj[id].answerPossibilityId];
		}

		return "";
	}

	function getPairAnswerForId(obj: Record<string, PairAnswer>, id: number, part: 1 | 2): string {
		if (id.toString() in obj) {
			let res;

			if (part === 1) {
				res = possibilities[obj[id].answerOneId];
			} else {
				res = possibilities[obj[id].answerTwoId];
			}

			return res !== undefined ? res : "";
		}

		return "";
	}

	function getGenderedAnswerForId(obj: Record<string, GenderedAnswer>, id: number, part: 1 | 2): string {
		if (id.toString() in obj) {
			let res;

			if (part === 1) {
				res = possibilities[obj[id].answerMaleId];
			} else {
				res = possibilities[obj[id].answerFemaleId];
			}

			return res !== undefined ? res : "";
		}

		return "";
	}
</script>

{#if answered_num > 0}
	<div class="sticky top-0">
		<div class="w-full rounded-b-lg bg-slate-700 py-4 text-center opacity-95">
			<h3 class="text-lg text-white">{answered_num} von {questions.length} Fragen beantwortet</h3>
		</div>
	</div>
{/if}

<div class="mx-2 lg:mx-8 xs:m-0">
	<h1 class="my-5 text-5xl dark:text-white">Umfrage</h1>
	<form
		class="my-5"
		method="POST"
		on:submit={() => {
			actionCall.set(true);
		}}
	>
		{#if questions.length > 0}
			{#each questions as question}
				{#if studentQuestions.length > 0 && question.id === studentQuestions[0].id}
					<h2 class="mt-8 mb-3 text-2xl dark:text-white">Schülerfragen</h2>
				{:else if teacherQuestions.length > 0 && question.id === teacherQuestions[0].id}
					<h2 class="mt-8 mb-3 text-2xl dark:text-white">Lehrerfragen</h2>
				{/if}
				<fieldset
					class="mt-2 rounded-xl border-4 border-solid border-slate-900 bg-slate-500 dark:bg-sky-700"
				>
					<legend
						class="mx-5 w-72 rounded-xl border-2 border-solid border-slate-900 bg-white p-2 text-left text-slate-900 md:w-96"
						>{question.question}</legend
					>
					<div>
						<input
							on:input|preventDefault={(event) =>
								search(event.target.value, question.teacherQuestion, question.id, question.genderedQuestion ? "m":"n")}
							on:focusin={(event) => {
								current = question.id;

								pair_part = 1;

								search(event.target.value, question.teacherQuestion, question.id, question.genderedQuestion ? "m":"n");
							}}
							on:focusout={(event) => {
								event.target.value = !question.pair
									? !question.genderedQuestion ? getAnswerForId(answers, question.id)
									: getGenderedAnswerForId(genderedanswers, question.id, 1)
									: getPairAnswerForId(pairanswers, question.id, 1);

								current = null;
							}}
							type="text"
							class="m-5 w-72 rounded-lg border-solid p-2"
							placeholder="Deine Antwort.."
							value={!question.pair
								? !question.genderedQuestion ? getAnswerForId(answers, question.id)
								: getGenderedAnswerForId(genderedanswers, question.id, 1)
								: getPairAnswerForId(pairanswers, question.id, 1)}
						/>
						{#if question.pair}
							<input
								on:input|preventDefault={(event) =>
									search(event.target.value, question.teacherQuestion, question.id, "n")}
								on:focusin={(event) => {
									current = question.id;

									pair_part = 2;

									search(event.target.value, question.teacherQuestion, question.id, "n");
								}}
								on:focusout={(event) => {
									event.target.value = getPairAnswerForId(pairanswers, question.id, 2);
									current = null;
								}}
								type="text"
								class="m-5 mt-0 w-72 rounded-lg border-solid p-2"
								placeholder="Deine Antwort.."
								value={getPairAnswerForId(pairanswers, question.id, 2)}
							/>
						{/if}
						{#if question.genderedQuestion}
							<input
								on:input|preventDefault={(event) =>
									search(event.target.value, question.teacherQuestion, question.id, "w")}
								on:focusin={(event) => {
									current = question.id;

									pair_part = 2;

									search(event.target.value, question.teacherQuestion, question.id, "w");
								}}
								on:focusout={(event) => {
									event.target.value = getGenderedAnswerForId(genderedanswers, question.id, 2);
									current = null;
								}}
								type="text"
								class="m-5 mt-0 w-72 rounded-lg border-solid p-2"
								placeholder="Deine Antwort.."
								value={getGenderedAnswerForId(genderedanswers, question.id, 2)}
							/>
						{/if}
						{#if current === question.id}
							<div
								transition:scale
								class="absolute z-10 w-fit rounded-xl rounded-t-none border-2 border-solid border-slate-900 bg-white"
							>
								{#each searchResults as possibility}
									<button
										class="w-full border-b-2 p-1.5 text-left text-lg hover:bg-slate-500"
										on:click={(event) => {
											event.preventDefault();
										}}
										on:mousedown={() => {
											if (!question.pair && !question.genderedQuestion) {
												if (question.id.toString() in answers) {
													answers[question.id].answerPossibilityId = possibility.id;
												} else {
													answers[question.id] = {
														answerPossibilityId: possibility.id,
													};
												}
											} else if(!question.genderedQuestion){
												let part = pair_part === 1 ? "answerOneId" : "answerTwoId";
												if (!(question.id.toString() in pairanswers)) {
													pairanswers[question.id] = {};
												}

												pairanswers[question.id][part] = possibility.id;
											} else {

												let part = pair_part === 1 ? "answerMaleId" : "answerFemaleId";
												if (!(question.id.toString() in genderedanswers)) {
													genderedanswers[question.id] = {};
												}

												genderedanswers[question.id][part] = possibility.id;

											}
										}}
									>
										{`${possibility.forename} ${possibility.surname}`}
									</button>
									<br />
								{/each}
							</div>
						{/if}
					</div>

					{#if question.id.toString() in answers}
						{#if "id" in answers[question.id.toString()]}
							<input hidden name="answerId" value={answers[question.id.toString()].id} />
						{/if}
						<input
							hidden
							name="answerPossibilityId"
							value={answers[question.id.toString()].answerPossibilityId}
						/>
					{:else if question.id.toString() in pairanswers}
						{#if "id" in pairanswers[question.id.toString()]}
							<input hidden name="answerId" value={pairanswers[question.id.toString()].id} />
						{/if}
						{#if "answerOneId" in pairanswers[question.id.toString()]}
							<input
								hidden
								name="answerOneId"
								value={pairanswers[question.id.toString()].answerOneId}
							/>
						{/if}
						{#if "answerTwoId" in pairanswers[question.id.toString()]}
							<input
								hidden
								name="answerTwoId"
								value={pairanswers[question.id.toString()].answerTwoId}
							/>
						{/if}
					{:else if question.id.toString() in genderedanswers}
						{#if "id" in genderedanswers[question.id.toString()]}
							<input hidden name="answerId" value={genderedanswers[question.id.toString()].id} />
						{/if}
						{#if "answerMaleId" in genderedanswers[question.id.toString()]}
							<input
								hidden
								name="answerMaleId"
								value={genderedanswers[question.id.toString()].answerMaleId}
							/>
						{/if}
						{#if "answerMaleId" in genderedanswers[question.id.toString()]}
							<input
								hidden
								name="answerFemaleId"
								value={genderedanswers[question.id.toString()].answerFemaleId}
							/>
						{/if}
					{/if}
					<input hidden name="questionId" value={question.id} />
				</fieldset>
			{/each}
		{:else}
			<h1 class="m-8 text-center dark:text-white">Es sind noch keine Fragen vorhanden.</h1>
		{/if}
		<input
			class="mt-8 w-full cursor-pointer rounded-xl bg-slate-500 p-4 text-lg text-white hover:bg-sky-700 dark:bg-sky-700 dark:hover:bg-slate-500"
			on:click={() => {isClicked = isClicked + 1;}} type="submit" disabled={isClicked > 1} value="Absenden"
		/>
	</form>
</div>
