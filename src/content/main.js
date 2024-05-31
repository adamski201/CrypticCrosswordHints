setTimeout(func => {
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

            guardianCrosswordPage.extractClues();

            const fifteensquaredPage = new FifteensquaredPage(fifteensquaredHtmlString);

            const definitions = fifteensquaredPage.extractDefinitions();

            guardianCrosswordPage.grid.generateUnderlinedClues(definitions);

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

}, 3000);

