import { Plugin } from 'obsidian';
import { BookService, IBookService } from 'src/bookService';
import { Verse } from 'src/entities';
import { DEFAULT_SETTINGS, Settings, SettingsTab } from 'src/settings';
import { BibleApiVerseService, IVerseService } from 'src/verseService';

/** ✨ This is where the magic happens ✨ */
const VERSE_PATTERN = /(?<book>\d?\w{2,3}) (?<chapter>\d{1,3}):(?<verseStart>\d{1,3})([-–—]?(?<verseEnd>\d{1,3}))?/gi

export default class BibleVerseQuicklookPlugin extends Plugin {
	settings: Settings

	async onload() {
		await this.loadSettings()

		const bookService: IBookService = new BookService();
		const verseService: IVerseService = new BibleApiVerseService();

		// TODO: add support for editing mode, too?

		// TODO: refactor this big boy
		this.registerMarkdownPostProcessor(async (element, context) => {
			const elems = ["p", "li"]

			for (const elem of elems) {
				const lines = element.findAll(elem);
				for (const line of lines) {
					const childNodes = Array.from(line.childNodes);
					const matches = [];

					// Iterate over all text nodes to find matches
					for (const node of childNodes) {
						if (node.nodeType === Node.TEXT_NODE) {
							const nodeText = node.textContent ?? '';
							const nodeMatches = [...nodeText.matchAll(VERSE_PATTERN)];
							if (nodeMatches.length > 0) {
								matches.push(...nodeMatches.map(match => ({ match, node })));
							}
						}
					}

					if (matches.length > 0) {
						// Cheating here to bypass HTMLElementTagNameMap requirement:
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						const newElem = createEl(elem as any);

						let prevEnd = 0;

						for (const { match, node } of matches) {
							const start = match.index ?? 0;
							const end = start + match[0].length;
							const text = node.textContent?.slice(start, end) ?? '';

							if (!match.groups) {
								throw new Error(`impossible: ${line}`);
							}

							const bookAbbreviation = match.groups.book;
							const book = bookService.lookupBookByAbbreviation(bookAbbreviation);
							if (book == null) {
								console.warn(`Could not find matching book for abbreviation: ${bookAbbreviation}`);
								continue;
							}

							const verse = {
								book,
								chapter: Number.parseInt(match.groups.chapter),
								verseStart: Number.parseInt(match.groups.verseStart),
								verseEnd: match.groups.verseEnd ? Number.parseInt(match.groups.verseEnd) : undefined,
							} as Verse;

							console.log(verse);

							// Append the text before the current match
							if (prevEnd < start) {
								newElem.appendChild(document.createTextNode(node.textContent?.substring(prevEnd, start) ?? ''));
							}

							// Create a span element with attributes
							const span = document.createElement('span');
							span.textContent = text;
							span.style.textDecoration = 'underline dotted';
							span.title = 'Loading...';
							span.dataset.loaded = 'false';
							span.dataset.verse = JSON.stringify({ verse });

							const onmouseover = `
if (this.dataset.loaded !== "true") {
	const verse = JSON.parse(this.dataset.verse);
	const title = localStorage.getItem("bible-verse-quicklook:${verse.book}:${verse.chapter}:${verse.verseStart}")
	if (title != null) {
		this.dataset.loaded = "true";
		this.title = title;
	} else {
		this.dataset.loaded = "true";
		${verseService.getLookVerseString(verse)}
		lookupVerse(verse).then(title => {
			this.title = title;
			localStorage.setItem("bible-verse-quicklook:${verse.book}:${verse.chapter}:${verse.verseStart}", title);
		});
	}
}`;
							span.setAttribute('onmouseover', onmouseover);
							newElem.appendChild(span);

							prevEnd = end;

							// Append the remaining text after the last match
							if (prevEnd < (node.textContent?.length ?? 0)) {
								newElem.appendChild(document.createTextNode(node.textContent?.substring(prevEnd) ?? ''));
							}

							// Replace the old node with the new element
							line.replaceWith(newElem);
						}
					}
				}

			}
		})

		this.addSettingTab(new SettingsTab(this.app, this))
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
	}

	async saveSettings() {
		await this.saveData(this.settings)
	}
}
