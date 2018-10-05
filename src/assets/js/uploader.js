import jszip from "jszip";
import X3P from "./x3p";
import Editor from "./editor";
import Popup from "./popup";

let parser = new DOMParser();
class X3PException {};

export default class Uploader {

    /**
     * Constructs a new uploader view
     */
    constructor() {
        this.label = document.querySelector(".upload label");
        this.input = document.querySelector(".upload input");
        this.setupListeners();
    }

    /**
     * Sets up event listeners
     */
    setupListeners() {
        let listener = e => e.preventDefault();
        for(let event of ["drag", "dragstart", "dragend", "dragover", "dragenter", "dragleave", "drop"]) {
            this.label.addEventListener(event, listener);
        }

        this.label.addEventListener("dragenter", () => this.label.classList.add("hover"));
        this.label.addEventListener("dragleave", () => this.label.classList.remove("hover"));
        this.label.addEventListener("drop", this.read.bind(this));
        this.input.addEventListener("change", e => this.read.apply(this, [e, true]));
    }

    /**
     * Read the file that was selected
     * 
     * @param {Event} e event object
     * @param {boolean} byclick whether or not this was triggered by clicking the upload stage
     */
    async read(e, byclick = false) {
        this.label.classList.remove("hover");

        let file = (!byclick) ? e.dataTransfer.files[0] : this.input.files[0];
        
        
        try {
            let zip = await jszip().loadAsync(file);
            fix3p.X3P = new X3P(zip, file.name);

            if(!(await fix3p.X3P.hasRequiredFiles())) {
                throw new X3PException();
            }

        } catch(x3pexception) {
            let error = new Popup(`<i class="fas fa-exclamation-triangle"></i> Please upload a valid X3P file.`);
            error.display(2, true);
            this.input.value = "";

            console.error(x3pexception);
            return;
        }

        let manifest = await fix3p.X3P.retrieve("main.xml");
        fix3p.editor.display(parser.parseFromString(manifest, "application/xml"));

        if(!(await fix3p.X3P.hasValidChecksum())) {
            let error = new Popup(`<i class="fas fa-exclamation-triangle"></i> Warning: X3P file contains invalid checksum`);
            error.display(2, true);
        }
    }

    /**
     * Displays the uploader screen
     */
    display() {
        document.querySelector("form").setAttribute("data-view", "uploader");
        this.input.value = "";
    }
}
