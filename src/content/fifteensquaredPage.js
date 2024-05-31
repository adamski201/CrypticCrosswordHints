class FifteensquaredPage {
    constructor(htmlDoc) {
        this.htmlDoc = htmlDoc;
    }

    /**
     * Extract definitions from the Fifteensquared HTML document by searching for underlined elements in the main body.
     *
     * A clue can have multiple definitions e.g. in the case of a double definition.
     * @returns {string[][]} An iterable of definitions for each clue.
     */
    extractDefinitions() {
        const articleBody = this.getSolutionArticleBody();

        const underlineElements = this.getUnderlineElements(articleBody);

        let definitionElements = Array.from(underlineElements).map(ele => ele.parentElement);

        definitionElements = Array.from(new Set(definitionElements));

        const definitions = definitionElements.map(ele => this.extractDefinitionGroup(ele));

        // Remove demonstrative underlining that is sometimes found on the Fifteensquared article page.
        if (definitions[0][0].toLowerCase() === "underlined") {
            definitions.shift();
        }

        return definitions;
    }

    /**
     * Return the div element of the Fifteensquared HTML document that contains the crossword definitions.
     * @returns {HTMLDivElement} The article's solution body.
     */
    getSolutionArticleBody() {
        return this.htmlDoc.querySelector(".entry-content");
    }

    /**
     * Return all child elements of the parent element which contain underline styling.
     * @param {Element} parent The element to query.
     * @returns {NodeListOf<Element>} An iterable of child elements.
     */
    getUnderlineElements(parent) {
        return parent.querySelectorAll('u, [style*="underline"]');
    }

    /**
     * Extract underlined text from the child nodes of the given element.
     *
     * Texts from consecutive underlined elements are concatenated to handle the case when underlines are erroneously
     * split mid-definition (a problem on Fifteensquared's site).
     * @param parent
     * @returns {string[]}
     */
    extractDefinitionGroup(parent) {
        let definitionNodes = parent.childNodes;

        // Don't remember why this is needed...
        definitionNodes[0].textContent = definitionNodes[0].textContent.trimStart();

        // Check if all child elements are underlined in the case of a double/triple definition.
        let allUnderlined = Array.from(definitionNodes).every(ele => this.isUnderlineElement(ele));

        if (allUnderlined) {
            return Array.from(definitionNodes, node => node.textContent);
        }

        let definitionGroup = [];
        let currentDefinition = "";

        for (let node of definitionNodes) {
            if (this.isUnderlineElement(node)) {
                currentDefinition += node.textContent;
            } else if (currentDefinition) {
                definitionGroup.push(currentDefinition);
                currentDefinition = "";
            }
        }

        // Append leftover definition to definition group.
        if (currentDefinition) {
            definitionGroup.push(currentDefinition);
        }

        return definitionGroup;
    }

    /**
     * Check if the given node is an element with underline styling.
     * @param {Node} node The node to check.
     * @returns {boolean} A boolean representing if the node is an element with underline styling.
     */
    isUnderlineElement(node) {
        if (node.nodeType !== Node.ELEMENT_NODE) {
            return false;
        }

        const tagName = node.tagName ? node.tagName.toLowerCase() : '';
        const isUnderlineTag = tagName === 'u';

        const hasUnderlineStyle = node.hasAttribute('style')
            && node.getAttribute('style').includes('underline');

        return (isUnderlineTag || hasUnderlineStyle);
    }
}
