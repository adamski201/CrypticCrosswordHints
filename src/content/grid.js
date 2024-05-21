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