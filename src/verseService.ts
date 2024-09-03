import { Verse } from "./entities"

interface IVerseService {
  lookupVerse(verse: Verse): Promise<string>
  getLookVerseString(verse: Verse): string
}

/**
 * VerseService implementation that uses https://docs.api.bible/.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ApiDotBibleVerseService implements IVerseService {
  apiBibleApiKey: string

  constructor(apiBibleApiKey: string) {
    this.apiBibleApiKey = apiBibleApiKey
  }

  lookupVerse(verse: Verse): Promise<string> {
    // TODO
    throw new Error("Method not implemented.")
  }

  getLookVerseString(verse: Verse): string {
    // TODO
    throw new Error("Method not implemented.")
  }
}

/**
 * VerseService implementation that uses https://bible-api.com/.
 * 
 * Source code for the API available at https://github.com/seven1m/bible_api.
 */
class BibleApiVerseService implements IVerseService {
  async lookupVerse(verse: Verse): Promise<string> {
    const response = await fetch(`https://bible-api.com/${verse.book} ${verse.chapter}:${verse.verseStart}`)
    if (!response.ok) {
      throw new Error(`Could not find verse for ${verse.book} ${verse.chapter}:${verse.verseStart}`);
    }
    const json = await response.json() as {
      verses: { text: string }[],
    }
    return json.verses[0].text.trim()
  }

  getLookVerseString(verse: Verse): string {
    return `
const lookupVerse = async (verse) => {
  const response = await fetch("https://bible-api.com/${verse.book} ${verse.chapter}:${verse.verseStart}");
  if (!response.ok) {
    throw new Error("Could not find verse for ${verse.book} ${verse.chapter}:${verse.verseStart}");
  }
  const json = await response.json();
  return json.verses[0].text.trim();
};
`
  }
}

export { ApiDotBibleVerseService, BibleApiVerseService }
export type { IVerseService }

