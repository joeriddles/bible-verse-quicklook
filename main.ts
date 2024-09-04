import { Plugin } from 'obsidian'
import { BookService } from 'src/bookService'
import Popup from 'src/components/Popup.svelte'
import { DEFAULT_SETTINGS, SettingsTab } from 'src/settings'
import store from 'src/store'
import { BibleApiVerseService } from 'src/verseService'

import type { IBookService } from 'src/bookService'
import type { Verse } from 'src/entities'
import type { Settings } from 'src/settings'
import type { IVerseService } from 'src/verseService'

/** ✨ This is where the magic happens ✨ */
const VERSE_PATTERN = /(?<book>\d?\w{2,3}) (?<chapter>\d{1,3}):(?<verseStart>\d{1,3})([-–—]?(?<verseEnd>\d{1,3}))?/gi

export default class BibleVerseQuicklookPlugin extends Plugin {
	settings!: Settings

	bookService!: IBookService
	verseService!: IVerseService

	async onload() {
		store.plugin.set(this);

		await this.loadSettings()

		this.bookService = new BookService()
		this.verseService = new BibleApiVerseService()

		// TODO: add support for editing mode, too?

		// TODO: refactor this big boy
		this.registerMarkdownPostProcessor(async (element, context) => {
			const elems = ["p", "li"]

			for (const elem of elems) {
				const lines = element.findAll(elem)
				for (const line of lines) {
					const html = line.innerHTML
					const matches = [...html.matchAll(VERSE_PATTERN)]
					if (matches) {

						// Cheating here to bypass HTMLElementTagNameMap requirement:
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						const newElem = createEl(elem as any)

						let end = -1
						let prevEnd = -1

						for (const match of matches) {
							const start = match.index ?? 0
							end = start + match[0].length
							const text = html.slice(start, end)

							if (!match.groups) {
								throw new Error(`impossible: ${line}`)
							}

							const bookAbbreviation = match.groups.book
							const book = this.bookService.lookupBookByAbbreviation(bookAbbreviation)
							if (book == null) {
								console.warn(`Could not find matching book for abbreviation: ${bookAbbreviation}`)
								continue
							}

							const verse = {
								book,
								text,
								chapter: Number.parseInt(match.groups.chapter),
								verseStart: Number.parseInt(match.groups.verseStart),
								verseEnd: match.groups.verseEnd ? Number.parseInt(match.groups.verseEnd) : undefined,
							} as Verse

							newElem.innerHTML += html.substring(prevEnd, start)
							newElem.dataset.verse = JSON.stringify(book)
							prevEnd = end
							// 							const onmouseover = `
							// if (this.dataset.loaded !== "true") {
							// 	const verse = JSON.parse(this.dataset.verse)
							// 	const title = localStorage.getItem("bible-verse-quicklook:${verse.book}:${verse.chapter}:${verse.verseStart}")
							// 	if (title != null) {
							// 		this.dataset.loaded = "true"
							// 		this.title = title
							// 	} else {
							// 		this.dataset.loaded = "true"
							// 		${verseService.getLookVerseString(verse)}
							// 		lookupVerse(verse).then(title => {
							// 			this.title = title
							// 			localStorage.setItem("bible-verse-quicklook:${verse.book}:${verse.chapter}:${verse.verseStart}", title)
							// 		})
							// 	}
							// }`
							// const span = newElem.createSpan({
							// 	text,
							// attr: {
							// 	"style": "text-decoration: underline dotted",
							// 	"title": "Loading...",
							// 	"data-loaded": "false",
							// 	"data-verse": JSON.stringify({ verse }),
							// 	"onmouseover": onmouseover,
							// }
							// }
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
							// )

							newElem.createDiv({}, (span: HTMLDivElement) => {
								new Popup({
									target: span,
									props: {
										verse,
									},
								});
							})
						}

						newElem.innerHTML += html.substring(end)
						line.replaceWith(newElem)
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
