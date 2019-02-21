import Uploader from "./uploader";
import Editor from "./editor";
import Popup from "./popup";
import Session from "./session";
import axios from "axios";

import "fullscreen-api-polyfill";
import "./ext";

declare var window: any;
declare var document: any;
declare var fix3p: any;

window.fix3p = {
    extLoaded: false,
    render: true
};

let session = new Session();

/**
 * Check if loaded in chrome extension
 */
try { 
    if(typeof window.chrome.runtime.id !== "undefined") {
        fix3p.extLoaded = true;
    }
} catch(e) {
    console.log("Chrome Extension not detected");
}

(async function main() {
    fix3p.uploader = new Uploader({ session });
    fix3p.uploader.display();
    
    fix3p.editor = new Editor({ session });

    let popup = new Popup("");
    try {
        let file = localStorage.getItem("openfile");

        if(file !== null) {
            localStorage.removeItem("openfile");
            popup.update("Reading file...");
            popup.display();
            
            file = decodeURIComponent(file);
            let contents = (await axios.get(file, { responseType: "blob" })).data;
            fix3p.uploader.read({ 
                dataTransfer: { 
                    files: [ new File([ contents ], "file.x3p") ]
                } 
            });
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
        session.end();
        return true;
    }
});