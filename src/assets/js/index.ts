// polyfills - must go before anything else is imported
import "@babel/polyfill";
import "fullscreen-api-polyfill";

// modules
import Uploader from "./uploader";
import Editor from "./editor";
import Popup from "./popup";
import Session from "./session";
import axios from "axios";
import Logger, { setup as setupLogger } from "./logger";

declare var window: any;
declare var document: any;

// setup files
import "./dom/setup";

class FiX3P {
    public session: Session = new Session();
    public extLoaded: boolean = false;
    public render: boolean = true;
    public reporting: boolean = localStorage.getItem("reporting") === "on";
    public version: string = document.querySelector(`meta[name="fix3p.version"]`).getAttribute("value");
    public uploader?: Uploader;
    public editor?: Editor;

    public constructor() {
        setupLogger(this);
        this.checkForExtension();
        this.setupScreens();

        let file = localStorage.getItem("openfile");
        this.init(file);
    }

    private checkForExtension() {
        try { 
            if(typeof window.chrome.runtime.id !== "undefined") {
                this.extLoaded = true;
            }
        } catch(e) {
            Logger.info("chrome extension not detected");
        }
    }

    private setupScreens() {
        this.uploader = new Uploader({ session: this.session });
        this.editor = new Editor({ session: this.session });
        this.uploader.display();
    }
    
    private async init(filename?: string) {
        if(filename === null) return;

        let popup = new Popup("");
        try {
            localStorage.removeItem("openfile");
            popup.update("Reading file...");
            popup.display();
            
            let file = await this.readLocalFile(filename);
            this.uploader.read(file);
            popup.hide(true);
        } catch(exception) {
            popup.update("Error reading X3P file.");
            popup.display(2, true);
            Logger.error("read error", filename);
        }
    }

    private async readLocalFile(filename: string): Promise<File> {
        filename = decodeURIComponent(filename);
        let xhrResponse = await axios.get(filename, { responseType: "blob" });
        let xhrData = xhrResponse.data;

        return new File([ xhrData ], filename);
    }
}

const fix3p = new FiX3P();
window.fix3p = fix3p;
export default fix3p;

