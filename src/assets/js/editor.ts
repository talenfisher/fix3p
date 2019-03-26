import { X3P } from "x3p.js";
import Stage from "./stage";
import Popup from "./popup";
import { rgbToHex } from "./color";
import { time, throws, CustomElement } from "./decorators";
import Logger from "./logger";
import Session from "./session";

const EMPTY = "";
const TAB_ATTR = "data-view";

const INPUT_TRANSFORMS = { 
    date: "datetime-local" 
};

const LABEL_TRANSFORMS = {
    MD5ChecksumPointData: "MD5 Checksum"
};

@CustomElement
export default class Editor extends HTMLElement {
    private nav: Element;
    private main: Element;
    private stage: Stage;
    private backbtn: HTMLElement;
    private count: number;

    /**
     * Constructs a new editor
     * @param el the editor node
     */
    connectedCallback() {
        this.nav = this.querySelector("nav");
        this.main = this.querySelector("main");
        this.stage = this.querySelector("fix3p-stage");
        
        this.backbtn = this.querySelector(".back");
        this.backbtn.onclick = Session.end.bind(Session);
        
        this.setupShortcuts();
        Session.on("start", this.display.bind(this));
        Session.on("end", this.reset.bind(this));
    }

    /**
     * Clears the contents of the <nav> and <main> elements
     */
    reset() {
        this.nav.innerHTML = EMPTY;
        this.main.innerHTML = EMPTY;
        this.tab = 1;
    }

    /**
     * Gets the current tab number
     */
    get tab() {
        return parseInt(this.getAttribute(TAB_ATTR));
    }

    /**
     * Switches to the specified tab
     * @param tab the tab number to switch to.
     */
    set tab(tab: number) {
        this.setAttribute(TAB_ATTR, tab.toString());
    }

    /**
     * Generates the editor from the contents of an X3P file
     * (as opposed to populating existing fields in the editor)
     * @param manifest root element of the main.xml file
     */
    generate(manifest) {
        Logger.action("editor generation started", Session.filename);
        this.count = 0;
        this.reset();
        this.setupDownloadButton();
        this.inputify(manifest, this.main);
        Logger.action("editor generation completed", Session.filename);
    }

    /**
     * Loops through a tree and creates input elements for each node
     *      
     * @param source the source tree to proxy 
     * @param target the target element to attach inputs to
     * @return the target element
     */
    inputify(source, target): HTMLElement { 
        for(let child of source.children) {

            let attrs = { "data-tag": child.tagName };
            for(let name of child.getAttributeNames()) {
                attrs[`data-${name}`] = child.getAttribute(name);
            }

            let el = document.createEasy("div", { attrs });
            
            if(child.children.length > 0 || child.getAttribute("type") === "section") {
                el = this.inputify(child, el);

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
     * @param tabName name of the tab
     * @return the resulting tab
     */
    createTab(tabName): HTMLElement {
        let tab = document.createEasy("div", {
            props: { "innerHTML": this.prettify(tabName) },
            attrs: { "data-target": tabName },
            classes: [ "tab" ]
        }) as HTMLElement;

        tab.onclick = (e) => {
            this.setAttribute("data-view", tab.index().toString());
        };

        return tab;
    }

    /**
     * Creates a new heading
     * @param headingName name of the heading
     * @return the resulting heading
     */
    createHeading(headingName): HTMLElement {
        return document.createEasy("h3", { 
            props: { 
                innerHTML: this.prettify(headingName) 
            } 
        }) as HTMLElement;
    }

    /**
     * Creates a new label
     * @param labelName the name of the label
     * @param id the id of the element the label is for
     * @return the resulting label
     */
    createLabel(labelName, id) {
        return document.createEasy("label", {
            props: { innerHTML: this.prettify(labelName) + ":" },
            attrs: { for: id }
        });
    }

    /**
     * Creates a new input
     * @param id the id of the input
     * @param node the node to proxy
     * @param disabled whether the input should be disabled or not
     * @return the resulting input
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

        let annotationEl = this.stage.paint.annotationInput;
        input.addEventListener("keyup", function(e) {
            node.innerHTML = this.value;

            if(node.tagName === "Annotation" && node.getAttribute("color") === rgbToHex(annotationEl.color)) {
                annotationEl.value = this.value;
            }
        });

        if(disabled) input.setAttribute("disabled", "disabled");
        return input;
    }

    /**
     * Displays the editor
     * @param x3p the x3p to edit
     */
    display(x3p: X3P) {
        let manifest = x3p.manifest.getTree();
        
        // remove parser error if present
        let body = manifest.querySelector("body");
        if(body) body.parentElement.removeChild(body);
        
        this.generate(manifest.children[0]);
        Session.emit("editor:ready", x3p);
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
     * Downloads the X3P file that is currently being edited
     * @param e the event parameters
     */
    @time({ max: 5000 })
    @throws({ message: "An error occurred." })
    async download(e) {
        if(!Session.started) return;
        e.preventDefault();

        let x3p = Session.x3p;
        await x3p.save();        
        
        let popup = new Popup("Compressing...");
        popup.display();

        await x3p.download();
        Logger.action("file downloaded", Session.filename);

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
            Session.end();
        };
    }

    /**
     * Sets up the download button and its event listeners
     */
    private setupDownloadButton() {
        let link = document.createEasy("a", {
            props: { href: "#" },
            classes: [ "tab" ]
        }) as HTMLElement;

        link.innerHTML = `<i class="fas fa-download"></i> Download</a>`;
        link.onclick = this.download.bind(this);
        this.nav.appendChild(link);
    }

    /**
     * Ctrl-S download shortcut
     * @param e Keyboard event arguments
     */
    private downloadShortcut(e: KeyboardEvent) {
        if((e.ctrlKey || e.metaKey) && e.which === 83) {
            e.preventDefault();
            this.download(e);
            return true;
        }
    }

    /**
     * Escape shortcut for closing the editor.
     * @param e Keyboard event arguments
     */
    private closeShortcut(e: KeyboardEvent) {
        if(e.which === 27 && document.fullscreenElement === null) {
            e.preventDefault();
            Session.end();
            return true;
        }
    }

    /**
     * Setup keyboard shortcuts
     */
    private setupShortcuts() {
        window.addEventListener("keydown", (e: KeyboardEvent) => {
            if(!Session.started) return;
            this.downloadShortcut(e);
            this.closeShortcut(e);
        });
    }
}