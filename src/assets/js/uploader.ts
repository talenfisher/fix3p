import X3P from "x3p.js";
import Popup from "./popup";
import Session from "./session";
import { throws, time, CustomElement } from "./decorators";
import Logger from "./logger";

/**
 * The uploader element
 */
@CustomElement("uploader")
export default class Uploader extends HTMLElement {
    private label: HTMLElement; 
    private input: HTMLInputElement; 
    private loadingPopup: Popup;

    /**
     * Constructs a new uploader view
     */
    connectedCallback() {
        this.label = this.querySelector(".upload label");
        this.input = this.querySelector(".upload input");
        this.loadingPopup = new Popup("Loading...", ["loading"]);

        this.setupListeners();
        Session.on("editor:ready", () => setTimeout(() => this.loadingPopup.hide(), 1000));
        Session.on("end", this.reset.bind(this));
    }

    /**
     * Sets up event listeners
     */
    setupListeners() {
        let listener = e => e.preventDefault();
        for(let event of ["drag", "dragstart", "dragend", "dragover", "dragenter", "dragleave", "drop"]) {
            this.label.addEventListener(event, listener);
        }

        this.label.addEventListener("dragenter", e => this.label.classList.add("hover"));
        this.label.addEventListener("dragleave", e => this.label.classList.remove("hover"));
        this.label.addEventListener("drop", e => {
            e.stopPropagation();
            this.read(e.dataTransfer.files[0]);
        });

        this.input.addEventListener("change", e => {
            e.stopPropagation();
            this.read(this.input.files[0]);
        });
    }

    /**
     * Read the file that was selected
     * 
     * @param file the file to read
     */
    @time({ max: 5000, reset: true })
    @throws({ message: "Please upload a valid X3P file.", classes: ["upload-error"], reset: true })
    async read(file: File) {
        if(Session.started) return;

        this.label.classList.remove("hover");
        this.loadingPopup.display();
        
        Logger.action(`read started`, file.name);
        let x3p = await X3P.load({ file });
        Logger.action(`read success`, file.name);
        
        Session.start(x3p, file.name);
    }
   
    /** 
     * Resets the uploader to its initial state
     */
    reset() {
        this.input.value = "";
    }
}