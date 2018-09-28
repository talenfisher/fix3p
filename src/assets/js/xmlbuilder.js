let serializer = new XMLSerializer();

const DOCTYPE = '<?xml version="1.0" encoding="UTF-8" standalone="no" ?>';

/**
 * Build XML document from HTML Inputs
 */
export default class XMLBuilder {
     
    /**
     * Constructs a new XMLBuilder
     * 
     * @param {Node} node the node to iterate through
     */
    constructor(node) {
        this.xml = document.implementation.createDocument("http://www.opengps.eu/2008/ISO5436_2", "p:ISO5436_2");
        this.xml.documentElement.setAttribute("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");
        this.xml.documentElement.setAttribute("xsi:schemaLocation", "http://www.opengps.eu/2008/ISO5436_2 http://www.opengps.eu/2008/ISO5436_2/ISO5436_2.xsd");
        this.iterator(node);
    }

    /**
     * Iterate through a node's children to build an XML Document
     * 
     * @param {Node} parent node to traverse
     * @param {XMLDocument} result node to append results to
     */
    iterator(parent, result = this.xml.documentElement) {
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

    toString() {
        return DOCTYPE + serializer.serializeToString(this.xml.documentElement);
    }
}  