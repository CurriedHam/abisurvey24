<script lang="ts">
	import { onMount } from "svelte";
	import { afterNavigate } from "$app/navigation";

	interface profileField {
		id?: number;
		friendQuestion: boolean;
		field: string;
	}

	export let data;

	let type: string;

	let fields: Array<profileField> = [];

	let picture_count = 0;

	function loadCallback() {
		type = data.type;

		fields = data.fields.map((field: profileField) => {
			return {
				id: field.id,
				friendQuestion: field.friendQuestion,
				field: field.field,
			};
		});

		picture_count = data.picture_count;
	};

	let new_field = "";
	let new_friend = false;

	$: new_profilefield = {
		friendQuestion: new_friend,
		field: new_field,
	};

	function add_field() {
		fields.push(new_profilefield);
		new_field = "";
		new_friend = false;
		fields = [...fields];
	}

	function remove_field(event: Event, index: number) {
		event.preventDefault();
		fields.splice(index, 1);
		fields = [...fields];
	}

	onMount(loadCallback);
	afterNavigate(loadCallback);
</script>

<div class="m-5">
	<h1 class="text-5xl dark:text-white">Steckbrief-Manager|
		{#if type === "student"}
			Schüler
		{:else}
			Lehrer
		{/if}</h1>
	<h2 class="mt-8 mb-3 text-2xl dark:text-white">Bilderanzahl</h2>
	<form method="POST" action="?/count">
		<div class="grid grid-cols-4 grid-rows-1 gap-2 rounded-xl bg-slate-500 p-5 text-white">
			<div class="col-span-2">
				<input
					bind:value={picture_count}
					class="w-full rounded-lg p-3 text-black"
					type="number"
					placeholder="Bilderanzahl.."
					name="count"
				/>
			</div>
			<div></div>
			<div class="col-span-1 place-self-center">
				<input type="submit" value="Speichern" class="rounded-xl bg-white p-3 text-slate-900" />
			</div>
		</div>
	</form>
	<h2 class="mt-8 mb-3 text-2xl dark:text-white">Feld hinzufügen</h2>
	<form on:submit|preventDefault={add_field}>
		<div
			class="grid grid-cols-4 grid-rows-2 gap-2 rounded-xl bg-slate-500 p-5 text-white sm:grid-rows-1"
		>
			<div class="col-span-3 sm:col-span-2">
				<input
					bind:value={new_field}
					class="w-full rounded-lg p-3 text-black"
					type="text"
					placeholder="Neues Feld.."
				/>
			</div>
			<div class="col-span-3 sm:col-span-1 sm:place-self-center">
				<label class="mr-2" for="genderedquestion">Freunde-Frage</label><input
					bind:checked={new_friend}
					class="scale-150"
					id="friendquestion"
					type="checkbox"
				/>
			</div>
			<div class="col-span-3 sm:col-span-1 sm:place-self-center">
				<input
					type="submit"
					value="Hinzufügen"
					class="w-full rounded-xl bg-white p-3 text-slate-900"
				/>
			</div>
		</div>
	</form>
	<h2 class="mt-8 mb-3 text-2xl dark:text-white">Aktuelle Felder</h2>
	<form class="my-5" method="POST" action="?/update">
		{#if fields.length > 0}
			{#each fields as field, i}
				<div
					class="my-2 grid grid-cols-4 grid-rows-2 gap-2 rounded-xl bg-slate-500 p-5 text-white sm:grid-rows-1"
				>
					<div class="col-span-3 sm:col-span-2">
						<input
							on:input|preventDefault={(event) => {
								field.field = event.target.value;
							}}
							value={field.field}
							class="w-full rounded-lg p-3 text-black"
							type="text"
							placeholder="Neues Feld"
							name="field"
						/>
					</div>
					<div class="col-span-3 sm:col-span-1 sm:place-self-center">
						<label class="mr-2" for="genderedquestion">Freunde-Frage</label><input
							bind:checked={field.friendQuestion}
							class="scale-150"
							name="friendQuestion"
							id="friendquestion"
							type="checkbox"
						/>
					</div>
					<div class="col-span-3 sm:col-span-1 sm:place-self-center">
						<button
							class="w-full rounded-xl bg-white p-3 text-slate-900"
							on:click={(event) => remove_field(event, i)}>Entfernen</button
						>
					</div>
					{#if field.id}
						<input hidden name="id" value={field.id} />
					{/if}
				</div>
			{/each}
		{:else}
			<h1 class="m-8 text-center dark:text-white">Es sind noch keine Felder vorhanden.</h1>
		{/if}
		<input
			class="mt-8 w-full rounded-xl bg-slate-500 p-4 text-lg text-white"
			type="submit"
			value="Felder aktualisieren"
		/>
	</form>
</div>
