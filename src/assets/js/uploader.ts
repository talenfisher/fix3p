import X3P from "x3p.js";
import Popup from "./popup";
import Session from "./session";
import { throws, time } from "./decorators";
import Logger from "./logger";

interface UploaderOptions {
    session: Session;
}

/**
 * The uploader element
 */
export default class Uploader {
    private session: Session;

    private label: HTMLElement; 
    private input: HTMLInputElement;
    private loadingPopup: Popup;

    /**
     * Constructs a new uploader view
     */
    constructor(options: UploaderOptions) {
        this.session = options.session;

        this.label = document.querySelector(".upload label");
        this.input = document.querySelector(".upload input");
        this.loadingPopup = new Popup("Loading...");

        this.setupListeners();
        this.session.on("end", this.display.bind(this));
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
     * @param e event parameters
     * @param byclick whether or not this was triggered by clicking the upload stage
     */
    @time({ max: 5000, reset: true })
    @throws({ message: "Please upload a valid X3P file.", reset: true })
    async read(file: File) {
        this.label.classList.remove("hover");
        this.loadingPopup.display();
        
        Logger.action(`read started`, file.name);
        let x3p = await new X3P({ file });

        Logger.action(`read success`, file.name);
        this.session.start(x3p, file.name);
    }

    /**
     * Resets the uploader to its initial state
     */
    reset() {
        this.loadingPopup.hide();
        this.input.value = "";
    }
  
    /**
     * Displays the uploader screen
     */
    display() {
        document.querySelector("form").setAttribute("data-view", "uploader");
        this.input.value = "";
    }
}
