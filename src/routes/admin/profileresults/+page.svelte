<script lang="ts">
	import { onMount } from "svelte";

	import Profile from "$lib/client/components/Profile.svelte";

	interface Attribute {
		answer: string;
		userId: number;
		editId: number;
		profileFieldId: number;
	}

	interface Picture {
		userId: number;
		image: string;
	}

	interface User {
		id: number;
		name: string;
	}

	interface Field {
		id: number;
		field: string;
	}

	export let data;

	let attributes: Record<string, Record<string, Attribute> | Record<string, never>> = {};
	let pictures: Record<string, Array<string>> = {};
	let users: Array<User> = [];
	let fields: Array<Field> = [];

	onMount(() => {
		data.users.forEach((user: User) => {
			attributes[user.id.toString()] = {};
			pictures[user.id.toString()] = [];
		});

		data.attributes.forEach((attribute: Attribute) => {
			attributes[attribute.userId.toString()][attribute.profileFieldId.toString()] = {
				answer: attribute.answer,
				userId: attribute.userId,
				editId: attribute.editId,
				profileFieldId: attribute.profileFieldId
			}
		});

		data.pictures.forEach((picture: Picture) => {
			pictures[picture.userId].push(picture.image);
		});

		users = data.users;
		fields = data.fields;
	});

	function getUser(id: number){

		for(let index in users){
			if(users[index].id == id){
				return users[index];
			}
		}

		return {id: 0, name:""};

	}

	function getAttributes(id: number){
		const field = attributes[id.toString()];
		let attribute: Record<string, string> = {};

		for(let index in field){
			attribute[field[index].profileFieldId.toString()] = `${(field[index] != undefined )?field[index].answer:""} ${(field[index] != undefined)?(field[index].editId != undefined)?(("-Von " + (getUser(field[index].editId).name)) + " beantwortet"):"":""}`;
		}

		return attribute;
	}

</script>

{#each users as { name, id }}
	<Profile
		user={name}
		attributes={getAttributes(id)}
		{fields}
		pictures={pictures[id.toString()]}
	/>
{/each}
