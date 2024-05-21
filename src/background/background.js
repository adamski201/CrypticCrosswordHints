chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    findValidUrlFromList(request.possibleURLs)
        .then(htmlText => {
            sendResponse(htmlText);
        })
        .catch(error => {
            console.error(`Error fetching URLs: ${error}`);
            sendResponse(null);
        });

    return true;
})
;


async function findValidUrlFromList(urls) {
    for (const url of urls) {
        console.log(`Trying to fetch from ${url}...`)
        const response = await fetch(url);
        console.log(response);

        if (response.ok) {
            console.info(`Found valid url at ${url}`);
            return response.text();
        } else {
            console.info(`Invalid url: ${response.status}`);
        }
    }

    return null;
}