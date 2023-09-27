<script lang="ts">
	import { isLoggedInAdmin } from "$lib/client/stores/auth";
	export let data;

	import { fade, slide, fly } from "svelte/transition";

	import { afterNavigate } from "$app/navigation";

	$: isLoggedInAdmin.set(data.loggedInAdmin);

	let show_possibility_types = false;
	let show_profile_types = false;
	let show_profileresult_types = false;
	let show_result_types = false;

	let show_dropdown = false;

	afterNavigate(() => {
		show_dropdown = false;
	});
</script>

{#if data.loggedInAdmin}
	<nav class="flex w-full items-center justify-start bg-slate-800 p-1 pl-8 text-white">
		<button
			on:click={() => {
				show_dropdown = !show_dropdown;
			}}
			class="mr-3"
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
					fill-rule="evenodd"
					d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"
				/>
			</svg>
		</button>
		{#if show_dropdown}
			<div class="ml-5 flex w-full flex-col sm:flex-row" transition:fade>
				<a class="m-1 hover:text-sky-500 hover:underline sm:p-2" href="/admin">
					<span style="display: inline-block" in:fly={{ x: -50 }} out:fly={{ x: -50 }}>
						Home
					</span></a>
					<div
					on:click={() => {
						show_possibility_types = !show_possibility_types;
					}}
					on:keydown={() => {
						[];
					}}
					class="relative m-1 inline-block cursor-pointer text-center sm:p-2">
					<div class="flex hover:text-sky-500 hover:underline">
						<p><span style="display: inline-block" in:fly={{ x: -50 }} out:fly={{ x: -50 }}>Users</span></p>
						<span style="display: inline-block" in:fly={{ x: -50 }} out:fly={{ x: -50 }}>
							<svg
								class="h-5 w-5"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
									clip-rule="evenodd"
								/>
							</svg>
						</span>
					</div>
					{#if show_possibility_types}
						<div
							class="absolute right-0 z-0 w-20 origin-top-right rounded-md bg-slate-700"
							transition:slide
						>
							<div class="py-1">
								<a class="block py-2 hover:bg-slate-500" href="/admin/users"
									>  Schüler</a
								>
								<a class="block py-2 hover:bg-slate-500" href="/admin/users_teachers"
									>  Lehrer</a
								>
							</div>
						</div>
					{/if}
				</div>
				<a
					class="m-1 hover:text-sky-500 hover:underline sm:p-2"
					href="/admin/questions"><span style="display: inline-block" in:fly={{ x: -50 }} out:fly={{ x: -50 }}>Fragen</span></a
				>
				<div
					on:click={() => {
						show_profile_types = !show_profile_types;
					}}
					on:keydown={() => {
						[];
					}}
					class="relative m-1 inline-block cursor-pointer text-center sm:p-2">
					<div class="flex hover:text-sky-500 hover:underline">
						<p><span style="display: inline-block" in:fly={{ x: -50 }} out:fly={{ x: -50 }}>Steckbrieffelder</span></p>
						<span style="display: inline-block" in:fly={{ x: -50 }} out:fly={{ x: -50 }}>
							<svg
								class="h-5 w-5"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
									clip-rule="evenodd"
								/>
							</svg>
						</span>
					</div>
					{#if show_profile_types}
						<div
							class="absolute center-0 z-10 w-20 origin-top-right rounded-md bg-slate-700"
							transition:slide
						>
							<div class="py-1">
								<a class="block py-2 hover:bg-slate-500" href="/admin/profiles/student"
									>  Schüler</a
								>
								<a class="block py-2 hover:bg-slate-500" href="/admin/profiles/teacher"
									>  Lehrer</a
								>
							</div>
						</div>
					{/if}
				</div>
				<a
					class="m-1 hover:text-sky-500 hover:underline sm:p-2"
					href="/admin/policy"><span style="display: inline-block" in:fly={{ x: -50 }} out:fly={{ x: -50 }}>Richtlinien</span></a
				>
				<div
					on:click={() => {
						show_result_types = !show_result_types;
					}}
					on:keydown={() => {
						[];
					}}
					class="relative m-1 inline-block cursor-pointer text-left sm:p-2">
					<div class="flex hover:text-sky-500 hover:underline">
						<p><span style="display: inline-block" in:fly={{ x: -50 }} out:fly={{ x: -50 }}>Ergebnisse</span></p>
						<span style="display: inline-block" in:fly={{ x: -50 }} out:fly={{ x: -50 }}>
							<svg
								class="h-5 w-5"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
									clip-rule="evenodd"
								/>
							</svg>
						</span>
					</div>
					{#if show_result_types}
						<div
							class="absolute center-0 z-10 w-20 origin-top-right rounded-md bg-slate-700"
							transition:slide
						>
							<center>
								<div class="py-1">
									<a class="block py-2 hover:bg-slate-500" href="/admin/evaluate/student">Schüler</a>
									<a class="block py-2 hover:bg-slate-500" href="/admin/evaluate/teacher">Lehrer</a>
								</div>
							</center>
						</div>
					{/if}
				</div>
				<div
					on:click={() => {
						show_profileresult_types = !show_profileresult_types;
					}}
					on:keydown={() => {
						[];
					}}
					class="relative m-1 inline-block cursor-pointer text-center sm:p-2">
					<div class="flex hover:text-sky-500 hover:underline">
						<p><span style="display: inline-block" in:fly={{ x: -50 }} out:fly={{ x: -50 }}>Steckbriefergebnisse</span></p>
						<span style="display: inline-block" in:fly={{ x: -50 }} out:fly={{ x: -50 }}>
							<svg
								class="h-5 w-5"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
									clip-rule="evenodd"
								/>
							</svg>
						</span>
					</div>
					{#if show_profileresult_types}
						<div
							class="absolute center-0 z-10 w-20 origin-top-right rounded-md bg-slate-700"
							transition:slide
						>
							<div class="py-1">
								<a class="block py-2 hover:bg-slate-500" href="/admin/profileresults/student"
									>  Schüler</a
								>
								<a class="block py-2 hover:bg-slate-500" href="/admin/profileresults/teacher"
									>  Lehrer</a
								>
							</div>
						</div>
					{/if}
				</div>
				<a
					class="m-1 hover:text-sky-500 hover:underline sm:p-2"
					href="/admin/quotes"><span style="display: inline-block" in:fly={{ x: -50 }} out:fly={{ x: -50 }}>Zitate</span></a
				>
			</div>
		{/if}
		<div class="m-4 ml-auto rounded-full bg-slate-900 p-4 text-white">
			<a class="hover:text-sky-500" href="/logout">Logout</a>
		</div>
	</nav>
	<slot />
{:else}
	<div class="absolute flex h-full w-full items-center justify-center overflow-hidden">
		<a href="/login_admin">
			<div class="rounded-xl bg-slate-900 p-8 text-center dark:bg-white">
				<h3 class="text-xl text-white dark:text-black">Du bist nicht eingelogt!</h3>
				<h3 class="text-lg text-sky-500 hover:underline">Login</h3>
			</div></a
		>
	</div>
{/if}
