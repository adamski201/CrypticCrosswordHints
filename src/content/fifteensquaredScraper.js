class FifteensquaredScraper {
    constructor() {
        this.possibleURLs = [];
    }

    /**
     * Converts a given date object to the format used by Fifteensquared URLs.
     * @param {Date} date The input date object to be formatted.
     * @returns {string} The formatted date string.
     */
    formatDateAsURL(date) {
        let year = date.getFullYear().toString();
        if (year.length === 1) {
            year = "0" + year;
        }
        let month = (date.getMonth() + 1).toString();
        if (month.length === 1) {
            month = "0" + month;
        }
        const day = (date.getDate()).toString();

        return `${year}/${month}/${day}`;
    }

    /**
     *
     * @param {Date} date A date object representing the article publication date.
     * @param {int} crosswordID The ID of the crossword.
     * @param {string} author The author of the crossword.
     * @param {string} crosswordType The type of the crossword.
     */
    getPossibleURLs(date, crosswordID, author, crosswordType) {
        const formattedDate = this.formatDateAsURL(date);

        this.possibleURLs = [
            `https://www.fifteensquared.net/${formattedDate}/guardian-${crosswordType}-${crosswordID}-${author}`,
            `https://www.fifteensquared.net/${formattedDate}/guardian-${crosswordType}-${crosswordID}-by-${author}`,
            `https://www.fifteensquared.net/${formattedDate}/${crosswordType}-${crosswordID}-${author}`,
            `https://www.fifteensquared.net/${formattedDate}/${crosswordType}-${crosswordID}-by-${author}`,
            `https://www.fifteensquared.net/${formattedDate}/guardian-${crosswordID}-${author}`,
            `https://www.fifteensquared.net/${formattedDate}/guardian-${crosswordType}-no-${crosswordID}-by-${author}`,
            `https://www.fifteensquared.net/${formattedDate}/guardian-${crosswordType}-no-${crosswordID}-${author}`
        ];
    }

    /**
     * Attempt to fetch an HTML string for a fifteensquared article that matches the provided URLs.
     * @returns {Promise<string>}
     */
    fetchArticle() {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({"possibleURLs": this.possibleURLs}, function (response) {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(response);
                }
            });
        });
    }
}