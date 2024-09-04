<script lang="ts">
	import type BibleVerseQuicklookPlugin from "../../main";
	import store from "../store";
	import type { Verse } from "../entities";
  import { onMount } from "svelte";
	export let verse: Verse;

  // onMount(() => {
  //   console.log(node)
  //   node.addEventListener('mouseover', onmouseover)
  // });

  let node: any
	let loaded = false;
	let tooltip = "Loading..."

	let plugin: BibleVerseQuicklookPlugin;
	store.plugin.subscribe((p: BibleVerseQuicklookPlugin) => (plugin = p));

	async function onmouseover() {
    console.log()

		if (!loaded) {
			loaded = true;
			const title = localStorage.getItem(
				`bible-verse-quicklook:${verse.book}:${verse.chapter}:${verse.verseStart}`,
			);
			title != null
				? (tooltip = title)
				: await plugin.verseService.lookupVerse(verse);
		}
	};
</script>

<!-- svelte-ignore a11y-mouse-events-have-key-events a11y-no-static-element-interactions -->
<div title={tooltip} on:mouseover={onmouseover} bind:this={node}>
	{verse.text}
</div>

<style>
	div {
    display: block;
		text-decoration: underline dotted;
	}
</style>
