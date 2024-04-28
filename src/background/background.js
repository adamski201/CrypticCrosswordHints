chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "fetchData") {
        const urls = [
            `https://www.fifteensquared.net/${request.date}/guardian-${request.crosswordType}-${request.crosswordId}-${request.author}`,
            `https://www.fifteensquared.net/${request.date}/guardian-${request.crosswordType}-${request.crosswordId}-by-${request.author}`,
            `https://www.fifteensquared.net/${request.date}/${request.crosswordType}-${request.crosswordId}-${request.author}`,
            `https://www.fifteensquared.net/${request.date}/${request.crosswordType}-${request.crosswordId}-by-${request.author}`,
            `https://www.fifteensquared.net/${request.date}/guardian-${request.crosswordId}-${request.author}`,
            `https://www.fifteensquared.net/${request.date}/guardian-${request.crosswordType}-no-${request.crosswordId}-by-${request.author}`,
            `https://www.fifteensquared.net/${request.date}/guardian-${request.crosswordType}-no-${request.crosswordId}-${request.author}`
        ]

        findValidUrlFromList(urls)
            .then(htmlText => {
                sendResponse(htmlText);
            })
            .catch(error => {
                console.error(`Error fetching URLs: ${error}`);
                sendResponse(null); // Sending null response in case of error
            });

        return true;
    }
});


async function findValidUrlFromList(urls) {
    for (const url of urls) {
        console.log(`Trying to fetch from ${url}...`)
        const response = await fetch(url);

        if (response.ok) {
            console.info(`Found valid url at ${url}`);
            return response.text();
        } else {
            console.info(`Invalid url: ${response.status}`);
        }
    }

    console.warn('No working URL found. Has the fifteensquared article been published yet?')

    return null;
}