class FifteensquaredPage {
    constructor(htmlDoc) {
        this.htmlDoc = htmlDoc;
        this.definitions = [];
    }

    /**
     * Extract definitions from the Fifteensquared HTML document by searching for underlined elements in the main body.
     */
    extractDefinitions() {
        const content = this.htmlDoc.querySelector(".entry-content");

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
                const child = children[i];
                const tagName = child.tagName ? child.tagName.toLowerCase() : '';
                const isUnderlineTag = tagName === 'u';
                const hasUnderlineStyle = child.hasAttribute('style')
                    && child.getAttribute('style').includes('underline');

                if (isUnderlineTag || hasUnderlineStyle) {
                    currentDefinition = currentDefinition.concat(child.textContent);
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

        // Remove 'demo' underlining that is sometimes found on the Fifteensquared article page.
        if (definitions[0][0].toLowerCase() === "underlined") {
            definitions.shift()
        }

        this.definitions = definitions;
    }
}
