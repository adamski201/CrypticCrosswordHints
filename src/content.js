const article = document.querySelector("article");

const loadingText = createLoadingText();

const targetElement = document.querySelector(".crossword__controls_autosave_label");

const divider = document.createElement('hr');
divider.style.backgroundColor = "#F1F1F1";
divider.style.border = "none";

targetElement.insertAdjacentElement("afterend", divider);

divider.insertAdjacentElement("afterend", loadingText);

const articleMetadata = getArticleMetadata();

const fetchMessage = createFetchMessage(articleMetadata);

fetchFifteensquaredArticle(fetchMessage)
    .then(htmlString => {
        if (htmlString) {
            const htmlDoc = parseHTMLStringToDOM(htmlString);

            const definitions = extractDefinitionsFromFifteensquaredHtml(htmlDoc);

            const clueElements = extractCluesFromGuardianHtml(document);

            loadingText.remove();

            const hintAllButton = createHintAllButton();

            const hintThisButton = createHintThisButton();

            divider.insertAdjacentElement("afterend", hintAllButton);

            hintAllButton.insertAdjacentElement("afterend", hintThisButton);

            document.getElementById("hintAllButton").addEventListener("click", function () {
                showDefinitions(definitions, clueElements);
            });
        } else {
            updateLoadingTextOnFailure(loadingText);
        }

    })
    .catch(error => {
        console.error('Error:', error);
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
            if (
                children[i].tagName && (children[i].tagName === 'u' ||
                (children[i].hasAttribute('style') && children[i].getAttribute('style').includes('underline')))
            ) {
                currentDefinition = currentDefinition.concat(children[i].textContent);
            }
            else if (currentDefinition) {
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
    const clues = htmlDoc.querySelectorAll(".crossword__clue");

    const clueElements = [];

    clues.forEach(function (clue) {
        clueElements.push(clue.querySelector(".crossword__clue__text"));
    });

    return clueElements;
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

function showDefinitions(definitions, clueElements) {
    let definition_idx = 0;
    clueElements.forEach(ele => {
        let clueText = ele.textContent
            .replaceAll(/\s{2,}/g, ' ')
            .replaceAll("’", "'")
            .trim()

        const clueDefinitions = definitions[definition_idx];

        let isMatched = false;
        clueDefinitions.forEach(definition => {
            definition = definition.replaceAll(/\s{2,}/g, ' ')
            definition = definition.replaceAll("’", "'")
            console.debug(`Attempting to match clue "${clueText}" with definition "${definition}"...`);
            if (clueText.includes(definition)) {
                console.debug("Matched!");
                isMatched = true;
                clueText = clueText.replace(definition, `<span style="text-decoration: underline;">${definition}</span>`);
            } else {
                console.debug(`No match found.`)
            }
        });

        ele.innerHTML = clueText;

        if (isMatched) {
            definition_idx += 1;
        }
    })
}

function createHintAllButton() {
    const button = document.createElement('button');
    button.classList.add("button");
    button.classList.add("button--primary");
    button.classList.add("button--crossword--current");
    button.style.backgroundColor = "#506991";
    button.style.borderColor = "#506991";
    button.textContent = 'Hint all';
    button.id = 'hintAllButton';

    return button;
}

function createHintThisButton() {
    const button = document.createElement('button');
    button.classList.add("button");
    button.classList.add("button--primary");
    button.classList.add("button--crossword--current");
    button.style.backgroundColor = "#506991";
    button.style.borderColor = "#506991";
    button.textContent = 'Hint this';
    button.id = 'hintThisButton';

    return button;
}

function createLoadingText() {
    const div = document.createElement('div');
    div.classList.add("crossword__controls_autosave_label");
    div.textContent = "Loading hints..."
    return div;
}

function updateLoadingTextOnFailure(loadingText) {
    loadingText.textContent = "No hints available for this crossword.";
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