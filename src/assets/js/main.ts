// polyfills - must go before anything else is imported
import "fullscreen-api-polyfill";

// modules
import Uploader from "./uploader";
import Editor from "./editor";
import Popup from "./popup";
import Session from "./session";
import axios from "axios";
import Logger, { setup as setupLogger } from "./logger";

declare var window: any;

// setup files
import "./dom/setup";


class FiX3P {
    public session: Session = new Session();
    public extLoaded: boolean = false;
    public render: boolean = true;
    public reporting: boolean = !!localStorage.getItem("reporting");
    public version: string = document.querySelector(`meta[name="fix3p.version"]`).getAttribute("value");
    public uploader?: Uploader;
    public editor?: Editor;

    public constructor() {
        setupLogger(this);
        this.checkForExtension();
        this.setupScreens();
        this.init();
    }

    public checkForExtension() {
        try { 
            if(typeof window.chrome.runtime.id !== "undefined") {
                this.extLoaded = true;
            }
        } catch(e) {
            Logger.info("chrome extension not detected");
        }
    }

    public setupScreens() {
        this.uploader = new Uploader({ session: this.session });
        this.editor = new Editor({ session: this.session });
        this.uploader.display();
    }

    async init() {
        let popup = new Popup("");
        try {
            let openFile = localStorage.getItem("openfile");
    
            if(openFile !== null) {
                localStorage.removeItem("openfile");
                popup.update("Reading file...");
                popup.display();
                
                openFile = decodeURIComponent(openFile);
                
                let contents = (await axios.get(openFile, { responseType: "blob" })).data;
                let file = new File([ contents ], openFile);
                this.uploader.read(file);
            }
    
            popup.hide(true);
        } catch(exception) {
            popup.update("Error reading X3P file.");
            popup.display(2, true);
            console.error(exception);
        }
    }
}

const fix3p = new FiX3P();
window.fix3p = fix3p;
export default fix3p;


window.addEventListener("keydown", e => {
    let view = document.querySelector("form").getAttribute("data-view");

    if((e.ctrlKey || e.metaKey) && e.which === 83)  {
        if(view !== "editor") return true;
        e.preventDefault();
        let tab = document.querySelector("a.tab") as HTMLElement;
        tab.click();
        return false;

    } else if(e.which === 27 && view === "editor" && document.fullscreenElement === null) {
        e.preventDefault();
        fix3p.session.end();
        return true;
    }
});

