import type BibleVerseQuicklookPlugin from "main";
import { writable } from "svelte/store";

const plugin = writable<BibleVerseQuicklookPlugin>();
export default { plugin };
