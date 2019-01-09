// @ts-ignore
import EditableFields from "./dat/editable-fields.json";
import { pathArray2DTS, prettyPrint } from "./functions";

console.log(EditableFields);
declare var window: any;
declare var fix3p: any;

const DOWNLOAD_BUTTON = '<a href="#" class="tab"><i class="fas fa-download"></i> Download</a>';

export default class Editor {
    private el: Element;
    private nav: Element;
    private main: Element;
    private stage: Element;
    private backbtn: Element;
    private count: number;

    /**
     * Constructs a new editor
     * @param {Node} el 
     */
    constructor(el = document.querySelector(".view")) {
        this.el = el;
        this.nav = this.el.querySelector("nav");
        this.main = this.el.querySelector("main");
        this.stage = this.el.querySelector(".stage");
        
        this.backbtn = this.el.querySelector(".back");
        this.backbtn.addEventListener("click", e => this.close());
    }

    /**
     * Clears the contents of the <nav> and <main> elements
     */
    clear() {
        this.nav.innerHTML = DOWNLOAD_BUTTON;
        this.main.innerHTML = '';
    }

    /**
     * Resets the values of all input elements in <main>
     */
    reset() {
        for(let node in this.main.querySelectorAll("input")) {
            //@ts-ignore
            node.value = "";
        }
    }
    
    /**
     * Generates the editor from the contents of an X3P file
     * (as opposed to populating existing fields in the editor)
     * @param {Node} manifest root element of the main.xml file
     */
    generate(manifest) {
        this.count = 0;
        this.clear();
        this.generateIterator(manifest, this.main);
    }

    /**
     * Loops through the root element of the main.xml file to generate 
     * elements within the editor view.
     * @param {Node} manifest root element of the main.xml file
     * @param {Node} target the target element to attach inputs to
     */
    generateIterator(manifest, target) {
        for(let child of manifest.children) {
            let el = document.createEasy("div", { attrs: { "data-tag": child.tagName } });
            
            if(child.children.length > 0) {
                el = this.generateIterator(child, el);

                // record headings should be tabs instead
                if(child.tagName.match(/^Record/g)) this.nav.appendChild(this.createTab(child.tagName));
                else el.insertBefore(this.createHeading(child.tagName), el.children[0]);
    
            } else {
                el.appendChild(this.createLabel(child.tagName, "x3p$"+this.count));
                el.appendChild(this.createInput("x3p$"+this.count, child.innerHTML, !EditableFields.includes(this.count)));
                this.count++;
            }
    
            target.appendChild(el);
        }
    
        return target;
    }

    /**
     * Creates a new tab
     * @param {string} tabName name of the tab
     * @return {Node} the resulting tab
     */
    createTab(tabName) {
        return document.createEasy("div", {
            props: { "innerHTML": prettyPrint(tabName) },
            attrs: { "data-target": tabName },
            classes: [ "tab" ]
        });
    }

    /**
     * Creates a new heading
     * @param {string} headingName name of the heading
     * @return {Node} the resulting heading
     */
    createHeading(headingName) {
        return document.createEasy("h3", { 
            props: { 
                innerHTML: prettyPrint(headingName) 
            } 
        });
    }

    /**
     * Creates a new label
     * @param {string} labelName the name of the label
     * @param {string} id the id of the element the label is for
     * @return {Node} the resulting label
     */
    createLabel(labelName, id) {
        return document.createEasy("label", {
            props: { innerHTML: prettyPrint(labelName) + ":" },
            attrs: { for: id }
        });
    }

    /**
     * Creates a new input
     * @param {string} id the id of the input
     * @param {string} value the value of the input
     * @param {boolean} disabled whether the input should be disabled or not
     * @return {Node} the resulting input
     */
    createInput(id, value, disabled = false) {
        let input = document.createEasy("input", {
            props: {
                type: "text",
                value: value,
                id: id
            }
        });    

        if(disabled) input.setAttribute("disabled", "disabled");
        return input;
    }

    /**
     * Populate editor fields rather than generating them (this is better suited for production)
     * @param {Node} node the root element of the main.xml file
     */
    populate(node: Element) {
        if(node.children.length === 0) {
            let selector = pathArray2DTS(node.getPath());
            let el = document.querySelector(selector + " input");
            
            if(el !== null) {
                (<HTMLInputElement> el).value = node.innerHTML;
            }
        } else {
            //@ts-ignore
            for(let subchild of node.children) {
                this.populate(subchild);
            }
        }
    }

    /**
     * Displays the editor
     * @param {DOMDocument} manifest a parsed main.xml file from within an X3P
     */
    display(x3p) {
        let manifest = x3p.manifest.getTree();
        
        let body = manifest.querySelector("body");
        body.parentElement.removeChild(body);

        this.generate(manifest.children[0]);

        /*
        if(window.fix3p.mode === "development") {
            this.generate(manifest.children[0]);
        } else {
            this.populate(manifest.children[0]);
        }*/

        document.querySelector("form").setAttribute("data-view", "editor");

        if(!fix3p.render) this.stage.setAttribute("disabled", "disabled");
        else this.stage.removeAttribute("disabled");
    }

    /**
     * Closes the editor
     */
    close() {
        if(fix3p.render) fix3p.X3P.surface.unrender();
        fix3p.uploader.display();
    }
}