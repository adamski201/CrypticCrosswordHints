const guardianCrosswordPage = new GuardianCrosswordPage(document, window.location.href);
const hintManager = new GuardianCrosswordHintManager(guardianCrosswordPage);

hintManager.createLoadingText();
hintManager.injectLoadingText();

guardianCrosswordPage.extractArticleMetadata();

const fifteensquaredScraper = new FifteensquaredScraper();

fifteensquaredScraper.getPossibleURLs(
    guardianCrosswordPage.articleDate,
    guardianCrosswordPage.crosswordId,
    guardianCrosswordPage.author,
    guardianCrosswordPage.crosswordType
);

fifteensquaredScraper.fetchArticle()
    .then(fifteensquaredHtmlString => {
        if (!fifteensquaredHtmlString) {
            hintManager.updateLoadingTextOnFailure();
            return;
        }

        const fifteensquaredPage = new FifteensquaredPage(
            parseHTMLStringToDOM(fifteensquaredHtmlString)
        );

        fifteensquaredPage.extractDefinitions();

        guardianCrosswordPage.extractClues();

        guardianCrosswordPage.grid.generateUnderlinedClues(fifteensquaredPage.definitions);

        hintManager.removeLoadingText();

        hintManager.createHintAllButton(guardianCrosswordPage.grid);
        hintManager.injectHintAllButton();

        hintManager.createHintThisButton(guardianCrosswordPage.grid);

        if (guardianCrosswordPage.isClueSelected()) {
            hintManager.injectHintThisButton();
        } else {
            hintManager.createClueSelectionMutationObserver();
        }

    })
    .catch(error => {
        console.error('Error:', error);
        hintManager.updateLoadingTextOnFailure();
    });

function parseHTMLStringToDOM(htmlString) {
    const div = document.createElement('div');
    div.innerHTML = htmlString;
    return div;
}

