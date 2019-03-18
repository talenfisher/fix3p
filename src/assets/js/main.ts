import Uploader from "./uploader";
import Editor from "./editor";
import Popup from "./popup";
import Session from "./session";
import axios from "axios";

import "fullscreen-api-polyfill";
import "./ext";
import Logger from "./logger";

declare var window: any;
declare var document: any;
declare var fix3p: any;

window.fix3p = {
    session: new Session(),
    extLoaded: false,
    render: true,
    reporting: !!localStorage.getItem("reporting")
};

/**
 * Check if loaded in chrome extension
 */
try { 
    if(typeof window.chrome.runtime.id !== "undefined") {
        fix3p.extLoaded = true;
    }
} catch(e) {
    Logger.info("chrome Extension not detected");
}

(async function main() {
    fix3p.uploader = new Uploader({ 
        session: fix3p.session,
    });
    
    fix3p.editor = new Editor({ 
        session: fix3p.session,
    });
    
    fix3p.uploader.display();

    let popup = new Popup("");
    try {
        let file = localStorage.getItem("openfile");

        if(file !== null) {
            localStorage.removeItem("openfile");
            popup.update("Reading file...");
            popup.display();
            
            file = decodeURIComponent(file);
            let contents = (await axios.get(file, { responseType: "blob" })).data;

            let dataTransfer = new DataTransfer();
            dataTransfer.items.add(new File([ contents], "file.x3p"));

            let ev = new DragEvent("drop", { dataTransfer });
            fix3p.uploader.read(ev);
        }

        popup.hide(true);
    } catch(exception) {
        popup.update("Error reading X3P file.");
        popup.display(2, true);
        console.error(exception);
    }
})();

window.addEventListener("keydown", e => {
    let view = document.querySelector("form").getAttribute("data-view");

    if((e.ctrlKey || e.metaKey) && e.which === 83)  {
        if(view !== "editor") return true;
        e.preventDefault();
        document.querySelector("a.tab").click();
        return false;

    } else if(e.which === 27 && view === "editor" && document.fullscreenElement === null) {
        e.preventDefault();
        fix3p.session.end();
        return true;
    }
});

window.onerror = function(message: string, url: string, lineNo: number, columnNo: number, error: object) {
    Logger.error(`unhandled error: ${message}`, fix3p.session.filename);
};