import X3P from "x3p.js";
import Popup from "./popup";
import Session from "./session";

declare var fix3p;

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

    /**
     * Constructs a new uploader view
     */
    constructor(options: UploaderOptions) {
        this.session = options.session;

        this.label = document.querySelector(".upload label");
        this.input = document.querySelector(".upload input");
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
        this.label.addEventListener("drop", this.read.bind(this));
        this.input.addEventListener("change", this.read.bind(this));
    }

    /**
     * Read the file that was selected
     * 
     * @param e event parameters
     * @param byclick whether or not this was triggered by clicking the upload stage
     */
    async read(e: DragEvent | Event) {
        e.stopPropagation();
        this.label.classList.remove("hover");

        let file = (e instanceof DragEvent) ? e.dataTransfer.files[0] : this.input.files[0];
        
        let loading = new Popup(`Loading...`, ["loading"]);
        loading.display();
        
        try {
            let x3p = await new X3P({ file });
            loading.hide(true);
            this.session.start(x3p);

        } catch(x3pexception) {
            loading.hide(true);

            let error = new Popup(`<i class="fas fa-exclamation-triangle"></i> Please upload a valid X3P file.`, ["upload-error"]);
            error.display(2, true);

            console.error(x3pexception);
        } finally {
            this.input.value = "";
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
