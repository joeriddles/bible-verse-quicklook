import abbreviations from './abbreviations.json';

interface IBookService {
  lookupBookByAbbreviation(abbrv: string): string | null
}

class BookService implements IBookService {
  lookupBookByAbbreviation(abbrv: string): string | null {
    // See if the abbreviation is a full book name
    const book = Object.keys(abbreviations).find(book => book === abbrv)
    if (book) {
      return book
    }

    // Now check all the abbreviations
    let matchingBook = null
    Object.entries(abbreviations).forEach(([book, abbreviationsForBook]) => {
      if (abbreviationsForBook.some(abbreviation => abbreviation === abbrv)) {
        matchingBook = book
        return
      }
    })

    return matchingBook
  }
}

export { BookService };
export type { IBookService };

