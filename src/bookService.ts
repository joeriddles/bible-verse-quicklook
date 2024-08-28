
interface IBookService {
  lookupBookByAbbreviation(abbrv: string): string | null
}

class BookService implements IBookService {
  private booksByAbbreviations = {
    John: ["Jn", "Jhn", "Joh"],
    // TODO: finish this list...
  }

  lookupBookByAbbreviation(abbrv: string): string | null {
    // See if the abbreviation is a full book name
    const book = Object.keys(this.booksByAbbreviations).find(book => book === abbrv)
    if (book) {
      return book
    }

    // Now check all the abbreviations
    let matchingBook = null
    Object.entries(this.booksByAbbreviations).forEach(([book, abbreviations]) => {
      if (abbreviations.some(abbreviation => abbreviation === abbrv)) {
        matchingBook = book
        return
      }
    })

    return matchingBook
  }
}

export { BookService }
export type { IBookService }

