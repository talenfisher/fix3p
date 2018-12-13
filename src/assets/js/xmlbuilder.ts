let serializer = new XMLSerializer();

const DOCTYPE = '<?xml version="1.0" encoding="UTF-8" standalone="no" ?>';

/**
 * Build XML document from HTML Inputs
 */
export default class XMLBuilder {
    private xml: Document;

    /**
     * Constructs a new XMLBuilder
     * 
     * @param {Node} node the node to iterate through
     */
    constructor(node) {
        //@ts-ignore
        this.xml = document.implementation.createDocument("", "p:ISO5436_2");
        this.iterator(node);
    }

    /**
     * Iterate through a node's children to build an XML Document
     * 
     * @param {Node} parent node to traverse
     * @param {XMLDocument} result node to append results to
     */
    iterator(parent, result: Element = this.xml.documentElement) {
        for(let node of parent.children) {

            if(typeof node.querySelectorImmediate("input") !== "undefined") {
                var name = node.getAttribute("data-tag");
                
                result.appendChild(this.xml.createEasy(name, {
                    props: {
                        innerHTML: node.querySelectorImmediate("input").value
                    }
                }));
    
            } else if(node.children.length > 0) {
                
                if(typeof node.getAttribute("data-tag") !== "undefined") {
                    let el = this.xml.createEasy(node.getAttribute("data-tag"));
                    result.appendChild(el);
                }
    
                this.iterator(node, result.lastElementChild || result);
            }
        }
    }

    /**
     * Converts the xml doc to a string
     * @return {string} xml document as a string
     */
    toString() {
        return DOCTYPE + serializer.serializeToString(this.xml.documentElement);
    }
}  