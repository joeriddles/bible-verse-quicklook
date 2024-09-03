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
			const lines = element.findAll("p")
			for (const line of lines) {
				const html = line.innerHTML;
				const matches = [...html.matchAll(VERSE_PATTERN)]
				if (matches) {
					const newLine = createEl("p")

					let end = -1;
					let prevEnd = -1;

					for (const match of matches) {
						const start = match.index ?? 0
						end = start + match[0].length
						const text = html.slice(start, end)

						if (!match.groups) {
							throw new Error(`impossible: ${line}`)
						}

						const bookAbbreviation = match.groups.book
						const book = bookService.lookupBookByAbbreviation(bookAbbreviation)
						if (book == null) {
							console.warn(`Could not find matching book for abbreviation: ${bookAbbreviation}`)
							continue
						}

						const verse = {
							book,
							chapter: Number.parseInt(match.groups.chapter),
							verseStart: Number.parseInt(match.groups.verseStart),
							verseEnd: match.groups.verseEnd ? Number.parseInt(match.groups.verseEnd) : undefined,
						} as Verse
						console.log(verse)

						newLine.innerHTML += html.substring(prevEnd, start)
						newLine.dataset.verse = JSON.stringify(book)
						prevEnd = end
						const onmouseover = `if (this.dataset.loaded !== "true") {
	this.dataset.loaded = "true";
	${verseService.getLookVerseString(verse)}
	const verse = JSON.parse(this.dataset.verse);
	lookupVerse(verse).then(title => this.title = title);
}`
						newLine.createSpan({
							text,
							attr: {
								"style": "text-decoration: underline dotted;",
								"title": "Loading...",
								"data-loaded": "false",
								"data-verse": JSON.stringify({ verse }),
								"onmouseover": onmouseover,
							}
						}
							// TODO: this does not work...
							// , (span) => {
							// 	span.onmouseover = () => {
							// 		console.log("onmouseover")
							// 		if (span.dataset.loaded !== "true") {
							// 			span.dataset.loaded = "true"
							// 			verseService.lookupVerse(verse).then(title => {
							// 				span.title = title
							// 				console.log(title)
							// 			})
							// 		}
							// 	}
							// }
						)
					}

					newLine.innerHTML += html.substring(end)
					line.replaceWith(newLine)
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
