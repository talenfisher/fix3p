import { X3P } from "x3p.js";
import Stage from "./stage";
import Popup from "./popup";
import { clearCache } from "typedarray-pool";

declare var fix3p: any;

const INPUT_TRANSFORMS = { 
    date: "datetime-local" 
};

const LABEL_TRANSFORMS = {
    MD5ChecksumPointData: "MD5 Checksum"
};

export default class Editor {
    private el: Element;
    private nav: Element;
    private main: Element;
    private stage: Stage;
    private canvas: Element;
    private backbtn: Element;
    private count: number;
    private file?: X3P;

    /**
     * Constructs a new editor
     * @param {Node} el 
     */
    constructor(el = document.querySelector(".view")) {
        this.el = el;
        this.nav = this.el.querySelector("nav");
        this.main = this.el.querySelector("main");
        this.stage = new Stage({ el: this.el.querySelector(".stage") });
        this.canvas = this.el.querySelector("canvas");
        
        this.backbtn = this.el.querySelector(".back");
        this.backbtn.addEventListener("click", e => this.close());
    }

    /**
     * Clears the contents of the <nav> and <main> elements
     */
    clear() {
        this.nav.innerHTML = '';
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
        this.setupDownloadButton();
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

            let attrs = { "data-tag": child.tagName };
            for(let name of child.getAttributeNames()) {
                attrs[`data-${name}`] = child.getAttribute(name);
            }

            let el = document.createEasy("div", { attrs });
            
            if(child.children.length > 0 || child.getAttribute("type") === "section") {
                el = this.generateIterator(child, el);

                // record headings should be tabs instead
                if(child.tagName.match(/^Record/g)) this.nav.appendChild(this.createTab(child.tagName));
                else el.insertBefore(this.createHeading(child.tagName), el.children[0]);
    
            } else {
                let label = child.tagName === "Annotation" ? child.getAttribute("color") : child.tagName;

                el.appendChild(this.createLabel(label, "x3p$"+this.count));
                el.appendChild(this.createInput("x3p$"+this.count, child, child.hasAttribute("disabled")));
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
        let tab = document.createEasy("div", {
            props: { "innerHTML": this.prettify(tabName) },
            attrs: { "data-target": tabName },
            classes: [ "tab" ]
        }) as HTMLElement;

        tab.onclick = (e) => {
            let view = document.querySelector(".view");
            view.setAttribute("data-view", tab.index().toString());
        };

        return tab;
    }

    /**
     * Creates a new heading
     * @param {string} headingName name of the heading
     * @return {Node} the resulting heading
     */
    createHeading(headingName) {
        return document.createEasy("h3", { 
            props: { 
                innerHTML: this.prettify(headingName) 
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
            props: { innerHTML: this.prettify(labelName) + ":" },
            attrs: { for: id }
        });
    }

    /**
     * Creates a new input
     * @param {string} id the id of the input
     * @param {Node} node the node to proxy
     * @param {boolean} disabled whether the input should be disabled or not
     * @return {Node} the resulting input
     */
    createInput(id, node: HTMLElement, disabled = false) {
        let typeName = node.getAttribute("type");
        let type = typeName in INPUT_TRANSFORMS ? INPUT_TRANSFORMS[node.getAttribute("type")] : "text";

        let input = document.createEasy("input", {
            props: {
                type: type,
                value: node.innerHTML,
                id: id
            }
        });    

        input.addEventListener("keyup", function(e) {
            node.innerHTML = this.value;
        });

        if(disabled) input.setAttribute("disabled", "disabled");
        return input;
    }

    /**
     * Displays the editor
     * @param {DOMDocument} manifest a parsed main.xml file from within an X3P
     */
    display(x3p: X3P) {
        this.file = x3p;
        let manifest = x3p.manifest.getTree();
        
        // remove parser error if present
        let body = manifest.querySelector("body");
        if(body) body.parentElement.removeChild(body);

        this.generate(manifest.children[0]);
        
        let form = document.querySelector("form");
        form.setAttribute("data-view", "editor");

        if(!fix3p.render) this.stage.enabled = false;
        else {
            this.stage.enabled = true;
            this.stage.file = x3p;
        }
    }

    /**
     * Prettifies a label.  By default, this simply adds spaces between
     * words and capitalizes them.  If a manual transform exists (see LABEL_TRANSFORMS),
     * the transform value is used instead
     */
    prettify(label: string) {
        if(label in LABEL_TRANSFORMS) {
            return LABEL_TRANSFORMS[label];
        }

        let result = "";
        for(let i = 0; i < label.length; i++) {
            if(i !== 0 && 
                isNaN(label[i] as unknown as number) && 
                label[i] === label[i].toUpperCase() && 
                label[i - 1] === label[i - 1].toLowerCase()) result += " "; // CX, CY don't get spaced
    
            result += label[i];
        }
    
        return result;
    }

    /**
     * Closes the editor
     */
    close() {
        this.stage.clear();
        this.file = null;
        this.clear();
        
        fix3p.uploader.display();
        clearCache(); // buffer allocation fails next time, unless the typedarray-pool cache is cleared
    }

    async download(e) {
        e.preventDefault();

        await this.file.save();
        
        let popup = new Popup("Compressing...");
        popup.display();

        await this.file.download();
        popup.update(`
            Continue editing this file? 
            <div class="popup-btns">
                <div id="continue-yes" class="popup-btn">Yes</div>
                <div id="continue-no" class="popup-btn">No</div>
            </div>
        `);
        
        let yes = popup.el.querySelector("#continue-yes") as HTMLElement;
        yes.onclick = e => popup.hide(true);

        let no = popup.el.querySelector("#continue-no") as HTMLElement;
        no.onclick = e => { 
            popup.hide(true);
            this.close();
        };
    }

    private setupDownloadButton() {
        let link = document.createEasy("a", {
            props: { href: "#" },
            classes: [ "tab" ]
        }) as HTMLElement;

        link.innerHTML = `<i class="fas fa-download"></i> Download</a>`;
        link.onclick = this.download.bind(this);
        this.nav.appendChild(link);
    }
}