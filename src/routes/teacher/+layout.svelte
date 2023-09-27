<script lang="ts">
	import { afterNavigate, beforeNavigate } from "$app/navigation";
	import { fade, slide, fly } from "svelte/transition";

	import { edited, actionCall } from "$lib/client/stores/refresh";

	import { env } from "$env/dynamic/public";

	const IMAGE_UPLOAD_URL = env.PUBLIC_IMAGE_UPLOAD_LINK;

	let show = false;
	let askConfirm = false;
	let isAction = false;

	edited.subscribe((value: boolean) => {
		askConfirm = value;
	});

	actionCall.subscribe((value: boolean) => {
		isAction = value;
	});

	afterNavigate(() => {
		edited.set(false);
		actionCall.set(false);
		show = false;
	});

	beforeNavigate((navigation) => {
		if (!isAction) {
			if (!navigation.willUnload && askConfirm) {
				if (
					!confirm(
						"Sicher, dass du die Seite verlassen willst? Nicht gespeicherte Daten können verloren gehen!",
					)
				) {
					navigation.cancel();
				}
			} else if (askConfirm) {
				navigation.cancel();
			}
		}
	});
</script>

<nav
	class="flex w-full items-center justify-start bg-slate-800 p-1 pl-8 text-white"
>
	<button
		on:click={() => {
			show = !show;
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
				fill-rule="evenodd"
				d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"
			/>
		</svg>
	</button>
	{#if show}
		<div class="ml-5 flex w-full flex-col sm:flex-row" transition:fade>
				<a class="m-1 hover:text-sky-500 hover:underline sm:p-2" href="/teacher/profiles"><span style="display: inline-block" in:fly={{ x: -50 }} out:fly={{ x: -50 }}>Steckbrief</span></a>
				<a class="m-1 hover:text-sky-500 hover:underline sm:p-2" href="/teacher/quotes"><span style="display: inline-block" in:fly={{ x: -50 }} out:fly={{ x: -50 }}>Zitate</span></a>
			{#if IMAGE_UPLOAD_URL}
				<div class="mb-4" transition:slide>
					<a class="m-1 hover:text-sky-500 hover:underline sm:p-2" href={IMAGE_UPLOAD_URL}>Bildupload</a>
				</div>
			{/if}
		</div>
	{/if}
	<div class="m-4 ml-auto rounded-full bg-slate-900 p-4 text-white">
		<a class="hover:text-sky-500" href="/logout">Logout</a>
	</div>
</nav>

<slot />
