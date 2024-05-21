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