const article = document.querySelector("article");

// Generate hint button and insert into page
hintButton = createHintButton()
hintButton.disabled = true;
const targetElement = document.querySelector(".crossword__controls_autosave_label");
targetElement.replaceWith(hintButton);

// Get article metadata
const author = document.querySelector('[rel="author"]').textContent
const crosswordId = window.location.href.split("/").at(-1);
const crosswordType = window.location.href.split("/").at(-2);
const articleDate = getFormattedArticleDate()

const clueElements = extractCluesFromGuardianHtml(document);

const msg = {
    action: "fetchData", date: articleDate, crosswordId: crosswordId, crosswordType: crosswordType, author: author
}

console.log("Attempting to fetch html from fifteensquared.net...")
fetchFifteensquaredArticle(msg)
    .then(htmlDoc => {
        if (htmlDoc) {
            const article = document.createElement('div');
            article.innerHTML = htmlDoc;

            let definitions = extractDefinitionsFromFifteensquaredHtml(article);

            updateHintButtonOnSuccessfulFetch();
            document.getElementById("activateButton").addEventListener("click", function () {
                showDefinitions(definitions, clueElements);
            });
        } else {
            console.log(`Fifteensquared article failed to retrieve.`);
            updateHintButtonOnFailedFetch();
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
        let children = parent.children;
        let definitionGroup = [];
        let currentDefinition = "";

        for (let i = 0; i < children.length; i++) {
            if (children[i].tagName === 'u' || (children[i].hasAttribute('style') && children[i].getAttribute('style').includes('underline'))) {
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

function createHintButton() {
    const button = document.createElement('button');
    button.textContent = 'Loading definition hints...';
    button.id = 'activateButton';

    return button;
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

function updateHintButtonOnSuccessfulFetch() {
    hintButton.disabled = false;
    hintButton.textContent = "Get definition hints!";
}

function updateHintButtonOnFailedFetch() {
    hintButton.textContent = "No definitions available."
}