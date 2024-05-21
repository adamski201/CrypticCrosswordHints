class GuardianCrosswordHintManager {
    constructor(guardianCrosswordPage) {
        this.guardianCrosswordPage = guardianCrosswordPage;
        this.loadingText = null;
        this.hintAllButton = null;
        this.hintThisButton = null;
    }

    createLoadingText() {
        const div = this.guardianCrosswordPage.htmlDoc.createElement('div');
        div.classList.add("crossword__controls_autosave_label");
        div.textContent = "Loading hints..."
        this.loadingText = div;
    }

    injectLoadingText() {
        const targetElement = this.guardianCrosswordPage.htmlDoc.querySelector(".crossword__controls__grid");
        targetElement.insertAdjacentElement('afterend', this.loadingText);
    }

    updateLoadingTextOnFailure() {
        this.loadingText.textContent = "No hints available for this crossword. \uD83D\uDEC8";
        const hoverText = "This can happen when the Fifteensquared article has not been published yet, or it uses an unusual URI.";
        this.loadingText.setAttribute("title", hoverText);
    }

    removeLoadingText() {
        this.loadingText.remove();
    }

    createHintAllButton(grid) {
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

        this.hintAllButton = button;
    }

    injectHintAllButton() {
        const targetElement = this.guardianCrosswordPage.htmlDoc.querySelector(".crossword__controls__grid");
        targetElement.insertAdjacentElement("afterend", this.hintAllButton);
    }

    createHintThisButton(grid) {
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

        this.hintThisButton = button;
    }

    injectHintThisButton() {
        this.hintAllButton.insertAdjacentElement("afterend", this.hintThisButton);
    }

    createClueSelectionMutationObserver() {
        const config = {attributes: true, subtree: true};

        const onAttributeChanged = (mutationList, observer) => {
            for (const mutation of mutationList) {
                if (mutation.type === "attributes") {
                    if (mutation.target.getAttribute("class").includes("crossword__clue--selected")) {
                        console.log(`Clue selected.`);
                        this.injectHintThisButton();
                        observer.disconnect();
                        break;
                    }
                }
            }
        };

        const clueSelectionObserver = new MutationObserver(onAttributeChanged);

        const mutationTarget = this.guardianCrosswordPage.htmlDoc.querySelector(".crossword__clues");

        clueSelectionObserver.observe(mutationTarget, config);
    }
}