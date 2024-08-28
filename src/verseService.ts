import { Verse } from "./entities"

interface IVerseService {
  lookupVerse(verse: Verse): Promise<string>
}

class VerseService implements IVerseService {
  lookupVerse(verse: Verse): Promise<string> {
    return Promise.resolve("hello world")
  }
}

export { VerseService }
export type { IVerseService }

