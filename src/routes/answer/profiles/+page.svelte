<script lang="ts">
	import { onMount } from "svelte";

	import { edited, actionCall } from "$lib/client/stores/refresh";

	import { identity } from "svelte/internal";

	import { order_possiblities } from "$lib/client/utils";

	import { scale } from "svelte/transition";

	import { userId } from "$lib/client/stores/auth.js";

	interface Possibility {
		forename: string;
		surname: string;
		isTeacher: boolean;
		id: number;
		personId: number;
	}

	interface Attribute {
		id?: number;
		answer: string;
		editId: number;
	}

	interface Friend_Attribute {
		id?: number;
		answer: string;
		profileFieldId: number;
		userId: number;
	}

	interface Field {
		id: number;
		friendQuestion: boolean;
		field: string;
	}

	interface Picture {
		id?: number;
		image: string | Blob;
	}

	export let data;

	let current: number;

	let iD: number;

	let fields: Array<Field> = [];

	let attributes: Record<string, Attribute> = {};

	let friend_attributes: Array<Friend_Attribute> = [];

	let possibilities: Array<Possibility> = [];

	let images: Record<string, Picture> = {};

	let picture_count = 0;

	let inputs;

	let FILE_SIZE_LIMIT = 0;

	let deletedPictures: Array<number> = [];

	onMount(() => {
		data.possibilities.forEach((possibility) => {

			possibilities[possibility.id] = possibility;
			
		});

		fields = data.fields;
		
		data.attributes.forEach((attribute) => {
			attributes[attribute.profileFieldId.toString()] = {
				id: attribute.id,
				answer: attribute.answer,
				editId: attribute.editId,
			};
		});

		friend_attributes = data.friend_attributes;

		picture_count = data.picture_count;

		inputs = Array(picture_count);

		data.pictures.forEach((picture, i) => {
			images[i.toString()] = {
				id: picture.id,
				image: picture.image,
			};
		});

		FILE_SIZE_LIMIT = data.size_limit;

		iD = data.iD;
	});

	let searchResults: Array<Possibility> = [];

	function getAttributeFor(id: number) {
		if (id.toString() in attributes) {
			return attributes[id].answer;
		}
		return "";
	}

	function getAttributeEditor(id: number) {
		if (id.toString() in attributes) {
			let tmp_editor = attributes[id].editId;
			if(tmp_editor != null){
				return attributes[id].editId;
			}
		}
		return -1;
	}

	function getPersonName(id: number) {
		if (id.toString() in possibilities) {
			return `${possibilities[id].forename} ${possibilities[id].surname}`;
		}
		return "";
	}

	function getField(id: number) {
		
		for(let field of fields){
			if(id == field.id){
				return field.field;
			}
		}

		return "Error: Melde dich bitte bei Lukas Ufer";
	}

	function setAttributeFor(id: number, value: string, editId: number) {
		edited.set(true);

		const str_id = id.toString();
		if (str_id in attributes) {
			attributes[str_id].answer = value;
		} else {
			attributes[str_id] = {
				answer: value,
				editId: editId,
			};
		}
	}

	async function processImage(image: Blob, num: number) {
		edited.set(true);

		if (!["image/png", "image/jpeg"].includes(image.type)) {
			alert("Dieses Dateiformat wird nicht unterstützt! Bitte nutze eine JPEG- oder PNG-Datei!");
		}

		if (image.size > FILE_SIZE_LIMIT && FILE_SIZE_LIMIT !== 0) {
			alert(
				`Das angegebene Bild ist zu groß! Bitte lade ein Bild hoch, das kleiner als ${
					FILE_SIZE_LIMIT / 1000000000
				} Gigabyte ist!`,
			);
		}

		const str_num = num.toString();

		if (str_num in images) {
			images[str_num]["image"] = image;
		} else {
			images[str_num] = {
				image: image,
			};
		}
	}

	function calculate_rows(value: string): number {
		let calculated_rows = (value.match(/\n/g) || []).length + 1;
		return calculated_rows < 5 ? calculated_rows : 5;
	}

	function search(term: string) {

		edited.set(true);

		let searchables: Array<Possibility> = [];

		possibilities.forEach((possibility) => {
			if(possibility.id != iD){
				searchables.push(possibility);
			}
		});

		searchResults = order_possiblities(term, searchables).slice(0, 4);
	}

</script>

<div class="mx-2 lg:mx-8 xs:m-0">
	<h1 class="my-5 text-5xl dark:text-white">Steckbrief</h1>
	<form
		class="my-5"
		method="POST"
		on:submit={() => {
			actionCall.set(true);
		}}
		enctype="multipart/form-data"
	>
		{#if fields.length > 0}
			{#each fields as { field, id, friendQuestion}}
				
				<fieldset
					class="mt-2 rounded-xl border-4 border-solid border-slate-900 bg-slate-500 dark:bg-sky-700"
				>
					<legend
						class="mx-5 w-72 rounded-xl border-2 border-solid border-slate-900 bg-white p-2 text-left text-slate-900 md:w-4/12"
						>{field}</legend
					>
					{#if !friendQuestion}
						<div>
							<textarea
								on:input|preventDefault={(event) => {
									let value = event.target.value;
									setAttributeFor(id, value, id);
									event.target.rows = calculate_rows(value);
								}}
								class="m-5 mx-auto block w-11/12 rounded-lg border-solid p-2 text-start"
								placeholder="Deine Antwort.."
								name="answer"
								rows={calculate_rows(getAttributeFor(id))}
								value={getAttributeFor(id)}
								maxlength="500"
							/>

							{#if id.toString() in attributes && "id" in attributes[id.toString()]}
								<input hidden name="attributeId" value={attributes[id.toString()].id} />
							{/if}
							<input hidden name="fieldId" value={id} />
						</div>
					{:else}
					
						<div class="m-6 mx-auto block w-11/12">
							<input
							on:input|preventDefault={(event) =>
								search(event.target.value)}
							on:focusin={(event) => {
								current = id;

								search(event.target.value);
							}}
							on:focusout={(event) => {
								event.target.value = getPersonName(getAttributeEditor(id));
								
								current = null;
							}}
							type="text"
							class="mx-auto rounded-lg border-solid p-2 text-start"
							placeholder="Wähle einen Freund aus"
							value={getPersonName(getAttributeEditor(id))}
							/>
							
							<input hidden name="editor" value={id in attributes ? (attributes[id].editId != null ? attributes[id].editId : -1):-1}/>
							
							{#if current === id}
								<div
									transition:scale
									class="absolute z-10 w-fit rounded-t-none border-2 border-solid border-slate-900 bg-white"
								>
									{#each searchResults as possibility}
										<button
											class="w-full border-b-2 p-1.5 text-left text-lg hover:bg-slate-500"
											on:click={(event) => {
												event.preventDefault();
											}}
											on:mousedown={() => {
												if (id.toString() in attributes) {
													attributes[id].editId = possibility.id;
												} else {
													attributes[id] = {
														answer: "",
														editId: possibility.id,
													};
												}
											}}
										>
											{`${possibility.forename} ${possibility.surname}`}
										</button>
										<br />
									{/each}
								</div>
								
							{/if}
							
							{#if id.toString() in attributes && "id" in attributes[id.toString()]}
								<input hidden name="attributeId" value={attributes[id.toString()].id} />
							{/if}
							<input hidden name="fieldId" value={id} />
						</div>
					{/if}
				</fieldset>
			{/each}
			{#if friend_attributes.length > 0}
				<h2 class="my-4 text-3xl dark:text-white">Fragen deiner Freunde:</h2>
				{#each friend_attributes as attribute}
					<fieldset
					class="mt-2 rounded-xl border-4 border-solid border-slate-900 bg-slate-500 dark:bg-sky-700"
					>
						<legend
						class="mx-5 w-72 rounded-xl border-2 border-solid border-slate-900 bg-white p-2 text-left text-slate-900 md:w-4/12"
						>Frage von {getPersonName(attribute.userId)}: {getField(attribute.profileFieldId)}</legend>

						<div>
							<textarea
								on:input|preventDefault={(event) => {
									let value = event.target.value;
									attribute.answer = value;
									event.target.rows = calculate_rows(value);
								}}
								class="m-5 mx-auto block w-11/12 rounded-lg border-solid p-2 text-start"
								placeholder="Deine Antwort.."
								name="answer"
								rows={calculate_rows(attribute.answer)}
								value={attribute.answer}
								maxlength="1800"
							/>

							<input hidden name="friendAttributeId" value={attribute.id} />
						</div>
						
					</fieldset>
				{/each}
			{/if}
			<div class="mx-auto grid max-w-4xl place-items-center gap-2 p-8 sm:grid-cols-2">
				{#each [...Array(picture_count).keys()] as i}
					<div class="relative inline-block w-full">
						{#if i in images}
							{@const imageData = images[i]["image"]}
							<button
								class="absolute right-2 top-2 z-10 origin-top-right rounded-full bg-white p-2 text-xl opacity-75"
								on:click|preventDefault={() => {
									images = structuredClone(images);
									const id = images[i].id;
									if (id !== undefined) {
										deletedPictures.push(id);
									}
									deletedPictures = [...deletedPictures];
									delete images[i];
								}}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									fill="currentColor"
									class="scale-150"
									viewBox="0 0 16 16"
								>
									<path
										d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"
									/>
								</svg>
							</button>
							<img
								src={typeof imageData === "string" ? imageData : URL.createObjectURL(imageData)}
								alt="Ungültige Datei"
								on:click|preventDefault={() => inputs[i].click()}
								on:keypress={() => {
									return 0;
								}}
								class="w-full cursor-pointer rounded-xl border-4 border-slate-900 dark:border-sky-700"
								loading="lazy"
							/>
						{:else}
							<button
								class="w-full rounded-xl bg-slate-500 p-5 text-lg text-white hover:bg-sky-700 dark:bg-sky-700 dark:hover:bg-slate-500"
								on:click|preventDefault={() => inputs[i].click()}>Bild hochladen..</button
							>
						{/if}
						<input
							name={i.toString() in images && "id" in images[i.toString()]
								? `image-${images[i.toString()].id}`
								: "image"}
							class="hidden"
							type="file"
							accept="image/png, image/jpeg"
							bind:this={inputs[i]}
							on:change={async (event) => {
								await processImage(event.target.files[0], i);
							}}
						/>
					</div>
				{/each}
			</div>
			{#each deletedPictures as del_id}
				<input type="text" hidden value={del_id.toString()} name="deleted_picture" />
			{/each}
		{:else}
			<h1 class="m-8 text-center dark:text-white">Es sind noch keine Fragen vorhanden.</h1>
		{/if}
		<input
			class="mt-8 w-full cursor-pointer rounded-xl bg-slate-500 p-4 text-lg text-white hover:bg-sky-700 dark:bg-sky-700 dark:hover:bg-slate-500"
			type="submit"
			value="Absenden"
		/>
	</form>
</div>
