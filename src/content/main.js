const loadingText = createLoadingText();
const targetElement = document.querySelector(".crossword__controls__grid");
insertElementAfter(targetElement, loadingText);

const guardianCrosswordPage = new GuardianCrosswordPage(document, window.location.href);

guardianCrosswordPage.extractArticleMetadata();

const fifteensquaredScraper = new FifteensquaredScraper();

fifteensquaredScraper.getPossibleURLs(
    guardianCrosswordPage.articleDate,
    guardianCrosswordPage.crosswordId,
    guardianCrosswordPage.author,
    guardianCrosswordPage.crosswordType
);

fifteensquaredScraper.fetchFifteensquaredArticle()
    .then(fifteensquaredHtmlString => {
        if (!fifteensquaredHtmlString) {
            updateLoadingTextOnFailure(loadingText);
            return;
        }

        const fifteensquaredPage = new FifteensquaredPage(parseHTMLStringToDOM(fifteensquaredHtmlString));

        fifteensquaredPage.extractDefinitions();

        guardianCrosswordPage.extractClues();

        guardianCrosswordPage.grid.generateUnderlinedClues(fifteensquaredPage.definitions);

        const hintAllButton = createHintAllButton(guardianCrosswordPage.grid);

        loadingText.replaceWith(hintAllButton);

        const clueSelectionMutationTarget = document.querySelector(".crossword__clues");

        if (clueSelectionMutationTarget.querySelector(".crossword__clue--selected")) {
            const hintThisButton = createHintThisButton(guardianCrosswordPage.grid);
            insertElementAfter(hintAllButton, hintThisButton);
        } else {
            createClueSelectionMutationObserver(clueSelectionMutationTarget, hintAllButton, guardianCrosswordPage.grid);
        }

    })
    .catch(error => {
        console.error('Error:', error);
        updateLoadingTextOnFailure(loadingText);
    });


function createHintAllButton(grid) {
    const button = document.createElement('button');
    button.classList.add("button");
    button.classList.add("button--primary");
    button.classList.add("button--crossword--current");
    button.style.backgroundColor = "#506991";
    button.style.borderColor = "#506991";
    button.textContent = 'Hint all';
    button.id = 'hintAllButton';

    button.addEventListener("click", function () {
        grid.toggleAllHints();
    });

    return button;
}

function createHintThisButton(grid) {
    const button = document.createElement('button');
    button.classList.add("button");
    button.classList.add("button--primary");
    button.classList.add("button--crossword--current");
    button.style.backgroundColor = "#506991";
    button.style.borderColor = "#506991";
    button.textContent = 'Hint this';
    button.id = 'hintThisButton';

    button.addEventListener("click", function () {
        grid.toggleHintForSelectedClue();
    });

    return button;
}

function createLoadingText() {
    const div = document.createElement('div');
    div.classList.add("crossword__controls_autosave_label");
    div.textContent = "Loading hints..."
    return div;
}

function updateLoadingTextOnFailure(loadingText) {
    loadingText.textContent = "No hints available for this crossword. \uD83D\uDEC8";
    const hoverText = "This can happen when the Fifteensquared article has not been published yet, or it uses an unusual URI.";
    loadingText.setAttribute("title", hoverText);
}

function parseHTMLStringToDOM(htmlString) {
    const div = document.createElement('div');
    div.innerHTML = htmlString;
    return div;
}

function insertElementAfter(targetElement, newElement) {
    targetElement.insertAdjacentElement("afterend", newElement);
}

function createClueSelectionMutationObserver(mutationTarget, hintAllButton, grid) {
    const config = {attributes: true, subtree: true};

    const onAttributeChanged = (mutationList, observer) => {
        for (const mutation of mutationList) {
            if (mutation.type === "attributes") {
                if (mutation.target.getAttribute("class").includes("crossword__clue--selected")) {
                    console.log(`Clue selected.`);
                    const hintThisButton = createHintThisButton(grid);
                    insertElementAfter(hintAllButton, hintThisButton);
                    observer.disconnect();
                    break;
                }
            }
        }
    };

    const clueSelectionObserver = new MutationObserver(onAttributeChanged);

    clueSelectionObserver.observe(mutationTarget, config);
}

