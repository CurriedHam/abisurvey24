<script lang="ts">
	import { onMount } from "svelte";
	import { afterNavigate } from "$app/navigation";

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

	//let attributes: Record<string, Record<string, Attribute> | Record<string, never>> = {};
	let attributes: Array<Attribute> = [];
	let pictures: Record<string, Array<string>> = {};
	let users: Array<User> = [];
	let fields: Array<Field> = [];

	function loadCallback() {

		users = [];

		data.users.forEach((user: User) => {
			//attributes[user.id.toString()] = {};
			pictures[user.id.toString()] = [];
			users.push({
				id: user.id,
				name: user.name,
			});
		});

		fields = data.fields;

		/*data.attributes.forEach((attribute: Attribute) => {
			attributes[attribute.userId.toString()][attribute.profileFieldId.toString()] = {
				answer: attribute.answer,
				userId: attribute.userId,
				editId: attribute.editId,
				profileFieldId: attribute.profileFieldId,
			}
		});*/
		
		console.log("HSEDFHIEUFILUEHFIUWEHFILEHFILUWEHFLUIWEHFILUWHEUPFHPÖIOWEUGHFÖOIQWEUGFPÖIUWGHELÖFI");

		data.pictures.forEach((picture: Picture) => {
			pictures[picture.userId].push(picture.image);
		});

		/*data.fields.forEach((field: Field) => {
			fields.push({
				id:  field.id,
				field: field.field,
			});
		})

		fields[0] = {id:13, field:"asdfasdf"};*/
		
		//users = data.users;
		//console.log(fields);
	};

	data.attributes.forEach((attribute) => {
		console.log(attribute.answer)
		console.log(attribute.userId)
		console.log(attribute.editId)
		console.log(attribute.profileFieldId)
			
	});
	
	//console.log(attributes["48"]["14"]);

	function getUser(id: number){

		for(let index in users){
			if(users[index].id == id){
				return users[index];
			}
		}

		return {id: 0, name:""};

	}

	function getAttributes(id: number){
		let field: Array<Attribute> = [];
		data.attributes.forEach((attribute) => {
			if(attribute.userId == id){
				field.push({
					answer: attribute.answer,
					userId: attribute.userId,
					editId: attribute.editId,
					profileFieldId: attribute.profileFieldId,
				})
			}
		});
		let attribute: Record<string, string> = {};

		for(let index in field){
			attribute[field[index].profileFieldId.toString()] = `${(field[index] != undefined )?field[index].answer:""} ${(field[index] != undefined)?(field[index].editId != undefined)?(("-Von " + (getUser(field[index].editId).name)) + " beantwortet"):"":""}`;
		}

		return attribute;
	}

	onMount(loadCallback);
	afterNavigate(loadCallback);

</script>
{#each users as { name, id }}
	<Profile
		user={name}
		attributes={getAttributes(id)}
		{fields}
		pictures={pictures[id.toString()]}
	/>
{/each}
