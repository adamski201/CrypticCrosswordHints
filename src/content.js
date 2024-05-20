const article = document.querySelector("article");

const loadingText = createLoadingText();
const targetElement = document.querySelector(".crossword__controls__grid");
insertElementAfter(targetElement, loadingText);

const articleMetadata = getArticleMetadata();
const fetchMessage = createFetchMessage(articleMetadata);

fetchFifteensquaredArticle(fetchMessage)
    .then(fifteensquaredHtmlString => {
        if (fifteensquaredHtmlString) {
            const fifteensquaredHtmlDoc = parseHTMLStringToDOM(fifteensquaredHtmlString);
            const definitions = extractDefinitionsFromFifteensquaredHtml(fifteensquaredHtmlDoc);

            const grid = extractCluesFromGuardianHtml(document);
            grid.generateUnderlinedClues(definitions);

            const hintAllButton = createHintAllButton(grid);

            loadingText.replaceWith(hintAllButton);

            const clueSelectionMutationTarget = document.querySelector(".crossword__clues");

            if (clueSelectionMutationTarget.querySelector(".crossword__clue--selected")) {
                const hintThisButton = createHintThisButton(grid);
                insertElementAfter(hintAllButton, hintThisButton);
            } else {
                createClueSelectionMutationObserver(clueSelectionMutationTarget, hintAllButton, grid);
            }

        } else {
            updateLoadingTextOnFailure(loadingText);
        }

    })
    .catch(error => {
        console.error('Error:', error);
        updateLoadingTextOnFailure(loadingText);
    });


function extractDefinitionsFromFifteensquaredHtml(htmlDoc) {
    const content = htmlDoc.querySelector(".entry-content");

    let underlineElements = content.querySelectorAll('u, [style*="underline"]');

    let definitionElementParents = Array.from(underlineElements).map(ele => ele.parentElement);

    // Remove duplicate elements.
    definitionElementParents = definitionElementParents.filter((element, index, self) => self.indexOf(element) === index);

    const definitions = [];

    definitionElementParents.forEach(parent => {
        let children = parent.childNodes;
        let definitionGroup = [];
        let currentDefinition = "";

        if (children[0].textContent[0] === " ") {
            children[0].textContent = children[0].textContent.trimStart();
        }

        for (let i = 0; i < children.length; i++) {
            if (children[i].tagName && (children[i].tagName === 'u' || (children[i].hasAttribute('style') && children[i].getAttribute('style').includes('underline')))) {
                currentDefinition = currentDefinition.concat(children[i].textContent);
            } else if (currentDefinition) {
                definitionGroup.push(currentDefinition);
                currentDefinition = "";
            }
        }

        if (currentDefinition) {
            definitionGroup.push(currentDefinition);
        }

        definitions.push(definitionGroup);
    });

    if (definitions[0][0].toLowerCase() === "underlined") {
        definitions.shift()
    }

    return definitions;
}

function extractCluesFromGuardianHtml(htmlDoc) {
    const grid = new Grid();

    const clueElements = htmlDoc.querySelectorAll(".crossword__clue");

    clueElements.forEach(function (clueElement) {
        const clueNumber = parseInt(clueElement.querySelector(".crossword__clue__number").textContent);

        const clueTextElement = clueElement.querySelector(".crossword__clue__text");

        const clue = new Clue(clueTextElement, clueNumber, clueTextElement.innerHTML);

        grid.clues.push(clue);
    });

    return grid;
}

function fetchFifteensquaredArticle(msg) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(msg, function (response) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(response)
            }
        });
    });
}

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

function getFormattedArticleDate() {
    const articleDateText = article.querySelector('[itemprop="datePublished"]')
        .getAttribute("datetime")
        .replace(")", "")

    const articleDate = new Date(Date.parse(articleDateText))

    let year = articleDate.getFullYear().toString()
    if (year.length === 1) {
        year = "0" + year
    }
    let month = (articleDate.getMonth() + 1).toString();
    if (month.length === 1) {
        month = "0" + month
    }
    const day = (articleDate.getDate()).toString();

    return `${year}/${month}/${day}`;
}

function parseHTMLStringToDOM(htmlString) {
    const div = document.createElement('div');
    div.innerHTML = htmlString;
    return div;
}

function getArticleMetadata() {
    const author = document.querySelector('[rel="author"]').textContent;
    const crosswordId = window.location.href.split("/").at(-1);
    const crosswordType = window.location.href.split("/").at(-2);
    const articleDate = getFormattedArticleDate();

    return {author, crosswordId, crosswordType, articleDate};
}

function createFetchMessage(metadata) {
    return {
        action: "fetchData",
        date: metadata.articleDate,
        crosswordId: metadata.crosswordId,
        crosswordType: metadata.crosswordType,
        author: metadata.author
    };
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

class Grid {
    constructor() {
        this.clues = [];
        this.allHintsToggled = false;
    }

    generateUnderlinedClues(definitions) {
        let definition_idx = 0;
        this.clues.forEach(clue => {
            let clueText = clue.element.textContent
                .replaceAll(/\s{2,}/g, ' ')
                .replaceAll("’", "'")
                .trim();

            const clueDefinitions = definitions[definition_idx];

            let isMatched = false;
            clueDefinitions.forEach(definition => {
                definition = definition.replaceAll(/\s{2,}/g, ' ').replaceAll("’", "'")
                console.debug(`Attempting to match clue "${clueText}" with definition "${definition}"...`);
                if (clueText.includes(definition)) {
                    console.debug("Matched!");
                    isMatched = true;
                    clueText = clueText.replace(definition, `<span style="text-decoration: underline;">${definition}</span>`);
                } else {
                    console.debug(`No match found.`)
                }
            });

            clue.underlinedHtml = clueText;

            if (isMatched) {
                definition_idx += 1;
            }
        })
    }

    toggleAllHints() {
        if (this.allHintsToggled) {
            this.clues.forEach(clue => {
                clue.element.innerHTML = clue.originalHtml;
                clue.hintToggled = false;
            });
            this.allHintsToggled = false;
        } else {
            this.clues.forEach(clue => {
                clue.element.innerHTML = clue.underlinedHtml;
                clue.hintToggled = true;
            });
            this.allHintsToggled = true;
        }
    }

    toggleHintForSelectedClue() {
        const selectedClue = document.querySelector(".crossword__clue--selected");
        const clueNumber = parseInt(selectedClue.querySelector(".crossword__clue__number").textContent);

        this.clues.find(clue => clue.number === clueNumber).toggleHint();
    }
}

class Clue {
    constructor(clueElement, clueNumber, clueInnerHTML) {
        this.element = clueElement;
        this.originalHtml = clueInnerHTML;
        this.number = clueNumber;
        this.underlinedHtml = null;
        this.hintToggled = false;
    }

    toggleHint() {
        if (this.hintToggled) {
            this.element.innerHTML = this.originalHtml;
            this.hintToggled = false;
        } else {
            this.element.innerHTML = this.underlinedHtml;
            this.hintToggled = true;
        }
    }
}