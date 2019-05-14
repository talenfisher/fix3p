// polyfills - must go before anything else is imported
import "@babel/polyfill";
import "@webcomponents/webcomponentsjs";
import "fullscreen-api-polyfill";

// modules
import Session from "./session";
import Popup from "./popup";
import axios from "axios";
import Logger, { setup as setupLogger } from "./logger";
import { getHeaderPart } from "./util";
import { Manifest } from "x3p.js";

declare var window: any;
declare var document: any;

// dom helpers and custom elements
import "./dom/setup";
import "./panorama";
import "./uploader";
import "./editor";
import "./stage";


class FiX3P {
    public session = Session;
    public extLoaded: boolean = false;
    public render: boolean = true;
    public reporting: boolean = localStorage.getItem("reporting") === "on";
    public version: string = document.querySelector(`meta[name="fix3p.version"]`).getAttribute("value");
    public decimation: number = Number(localStorage.getItem("decimation"));
    public presets: string = localStorage.getItem("presets") || "";

    public constructor() {
        setupLogger(this);
        Manifest.defaultMask = this.presets;
        this.checkForExtension();

        document.on("WebComponentsReady", () => {
            let file = localStorage.getItem("openfile");
            console.log(file);
            this.init(file);
        });
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
    
    private async init(filename?: string) {
        if(filename === null) return;

        let popup = new Popup("");
        try {
            localStorage.removeItem("openfile");
            popup.update("Reading file...");
            popup.display();
            
            let file = await this.readLocalFile(filename);
            let uploader = document.querySelector("fix3p-uploader");
            
            popup.hide(true);
            uploader.read(file);
            
        } catch(exception) {
            popup.update("Error reading X3P file.");
            popup.display(2, true);
            Logger.error("read error", filename);
        }
    }

    private async readLocalFile(filename: string): Promise<File> {
        let xhrResponse = await axios.get(filename, {
            headers: {
                "Accept": "*/*",
                "X-Requested-With": "fix3p"
            },
            responseType: "blob" 
        });
        
        let xhrData = xhrResponse.data;
        let headers = xhrResponse.headers;

        // if the downloaded file was an attachment, get the real filename from the content-disposition header
        filename = "content-disposition" in headers ? getHeaderPart(headers["content-disposition"], "filename") : filename;
        return new File([ xhrData ], filename);
    }
}

const fix3p = new FiX3P();
window.fix3p = fix3p;
export default fix3p;

