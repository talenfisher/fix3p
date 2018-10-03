import jszip from "jszip";
import ZipHolder from "./zipholder";
import Editor from "./editor";
import Popup from "./popup";

let parser = new DOMParser();
class X3PException {};

export default class Uploader {
    constructor() {
        this.label = document.querySelector(".upload label");
        this.input = document.querySelector(".upload input");
        this.setupListeners();
    }

    setupListeners() {
        let listener = e => e.preventDefault();
        for(let event of ["drag", "dragstart", "dragend", "dragover", "dragenter", "dragleave", "drop"]) {
            this.label.addEventListener(event, listener);
        }

        this.label.addEventListener("dragenter", () => this.label.classList.add("hover"));
        this.label.addEventListener("dragleave", () => this.label.classList.remove("hover"));
        this.label.addEventListener("drop", this.read);
        this.input.addEventListener("change", e => this.read(e, true));
    }

    /**
     * Read the file that was selected
     * 
     * @param {*} e 
     * @param {*} byclick 
     */
    async read(e, byclick = false) {
        this.label.classList.remove("hover");

        let file = (!byclick) ? e.originalEvent.dataTransfer.files[0] : this.input.files[0];
        let zip = await jszip().loadAsync(file);
        
        try {
            fix3p.ZipHolder = new ZipHolder(zip, file.name);
            if(!(await fix3p.ZipHolder.isValid())) {
                throw new X3PException();
            }

        } catch(x3pexception) {
            let error = new Popup("Please upload a valid X3P file.");
            error.display(2);
            this.input.value = "";
            return;
        }

        let manifest = await fix3p.ZipHolder.retrieve("main.xml");
        let editor = new Editor();

        editor.display(parser.parseFromString(manifest, "application/xml"));
    }
}
