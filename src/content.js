const article = document.querySelector("article");

// Generate hint button and insert into page
hintButton = createHintButton()
hintButton.disabled = true;
const targetElement = document.querySelector(".crossword__controls_autosave_label");
targetElement.replaceWith(hintButton);
document.getElementById("activateButton").addEventListener("click", function () {
    showDefinitions(definitions, clueElements);
});

// Get article metadata
const author = document.querySelector('[rel="author"]').textContent
const crosswordId = window.location.href.split("/").at(-1);
const crosswordType = window.location.href.split("/").at(-2);
const articleDate = getFormattedArticleDate()

let definitions;

console.log("Extracting clues from page...")
const clueElements = extractCluesFromHtml(document);
console.log(`Found ${clueElements.length} clues.`)

const msg = {
    action: "fetchData",
    date: articleDate,
    crosswordId: crosswordId,
    crosswordType: crosswordType,
    author: author
}

console.log("Attempting to fetch html from fifteensquared.net...")
fetchFifteensquaredArticle(msg)
    .then(response => {
        if (response) {
            const article = document.createElement('div');
            article.innerHTML = response;
            definitions = extractDefinitionsFromHtml(article);
            console.log(`Retrieved definitions; found ${definitions.length}.`)
            updateHintButtonOnSuccessfulFetch()
        } else {
            console.log(`Fifteensquared article failed to retrieve.`)
            updateHintButtonOnFailedFetch()
        }

    })
    .catch(error => {
        console.error('Error:', error);
    });


function extractDefinitionsFromHtml(htmlDoc) {
    const content = htmlDoc.querySelector(".entry-content");

    let underlineElements = content.querySelectorAll('u, [style*="underline"]');

    // Get parents of the definition elements and remove duplicates.
    let definitionElementParents = Array.from(underlineElements).map(ele => ele.parentElement)
    definitionElementParents = definitionElementParents.filter(
        (element, index, self) => self.indexOf(element) === index
    );

    const definitions = [];

    definitionElementParents.forEach(parent => {
        let definitionElement = Array.from(parent.querySelectorAll(('u, [style*="underline"]')));
        const definition = definitionElement.map(ele => ele.textContent)
        definitions.push(definition)
    });

    if (definitions[0][0].toLowerCase() === "underlined") {
        definitions.shift()
    }

    return definitions;
}

function extractCluesFromHtml(htmlDoc) {
    const clues = htmlDoc.querySelectorAll(".crossword__clue");

    const clueElements = [];

    clues.forEach(function (clue) {
        const num = clue.querySelector(".crossword__clue__number").textContent;
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
    let i = 0;

    clueElements.forEach(ele => {
        let clueText = ele.textContent;
        const clueDefinitions = definitions[i];

        let isMatched = false;
        clueDefinitions.forEach(definition => {
            console.debug(`Attempting to match clue "${clueText}" with definition "${definition}"...`);
            if (clueText.replaceAll(" ", "").includes(definition.replaceAll(" ", ""))) {
                console.debug("Matched!");
                isMatched = true;
                clueText = clueText.replace(/\s{2,}/g, ' ');
                clueText = clueText.replace(definition.trim(), `<span style="text-decoration: underline;">${definition.trim()}</span>`);
            } else {
                console.debug(`No match found.`)
            }
        });

        ele.innerHTML = clueText;

        if (isMatched) {
            i += 1;
        }
    })
}

function createHintButton() {
    const buttonHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Button Below Element Example</title>
</head>
<body>
    <div id="targetElement">
        <!-- Existing content -->
    </div>

    <script src="script.js"></script>
</body>
</html>`
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