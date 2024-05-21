class GuardianCrosswordPage {
    constructor(htmlDoc, URL) {
        this.htmlDoc = htmlDoc;
        this.URL = URL;
        this.grid = null;
        this.articleDate = null;
        this.author = null;
        this.crosswordId = null;
        this.crosswordType = null;
    }

    extractArticleMetadata() {
        this.author = this.htmlDoc.querySelector('[rel="author"]').textContent;
        this.crosswordId = this.URL.split("/").at(-1);
        this.crosswordType = this.URL.split("/").at(-2);
        this.articleDate = this.extractArticleDate();
    }

    extractArticleDate() {
        const articleDateText = this.htmlDoc.querySelector('[itemprop="datePublished"]')
            .getAttribute("datetime")
            .replace(")", "");

        return new Date(Date.parse(articleDateText));
    }

    extractClues() {
        const grid = new Grid();

        const clueElements = this.htmlDoc.querySelectorAll(".crossword__clue");

        clueElements.forEach(function (clueElement) {
            const clueNumber = parseInt(clueElement.querySelector(".crossword__clue__number").textContent);

            const clueTextElement = clueElement.querySelector(".crossword__clue__text");

            const clue = new Clue(clueTextElement, clueNumber, clueTextElement.innerHTML);

            grid.clues.push(clue);
        });

        this.grid = grid;
    }
}
