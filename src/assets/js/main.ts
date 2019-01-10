import Uploader from "./uploader";
import Editor from "./editor";
import Popup from "./popup";
import axios from "axios";
import show from "ndarray-show";

import "fullscreen-api-polyfill";
import "./ext";

declare var window: any;
declare var document: any;
declare var fix3p: any;

window.fix3p = {
    extLoaded: false,
    render: true
};

window.show = show;

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
    fix3p.uploader = new Uploader;
    fix3p.uploader.display();
    fix3p.editor = new Editor;

    let popup = new Popup("");
    try {
        let file = localStorage.getItem("openfile");

        if(file !== null) {
            localStorage.removeItem("openfile");
            popup.update("Reading file...");
            popup.display();
            
            let contents = (await axios.get(decodeURIComponent(file), { responseType: "blob" })).data;
            fix3p.uploader.read({ 
                dataTransfer: { 
                    files: [ new File([contents], "file.x3p") ]
                } 
            });

            popup.hide(true);
        }

    } catch(exception) {
        popup.update("Error reading X3P file.");
        popup.display(2, true);
        console.error(exception);
    }
})();


// setup tabs
document.addEventListener("click", async e => {
    if((<Element>e.target).matches("a.tab")) { 
        e.preventDefault();
        
        fix3p.X3P.save();
        
        let popup = new Popup("Compressing...");
        popup.display();

        await fix3p.X3P.download();
        popup.update(`Continue editing this file? <div class="popup-btns"><div id="continue-yes" class="popup-btn">Yes</div><div id="continue-no" class="popup-btn">No</div></div>`);
        
        popup.el.querySelector("#continue-yes").addEventListener("click", e => {
            popup.hide(true);
        });

        popup.el.querySelector("#continue-no").addEventListener("click", e => {
            popup.hide(true);
            fix3p.editor.close();
        });

    } else if((<Element>e.target).matches(".tab:not(a)")) {
        document.querySelector(".view").setAttribute("data-view", (<Element>e.target).index().toString());
    }
});

window.addEventListener("keydown", e => {
    if((e.ctrlKey || e.metaKey) && e.which === 83)  {
        if(document.querySelector("form").getAttribute("data-view") !== "editor") return true;
        e.preventDefault();
        document.querySelector("a.tab").click();
        return false;

    } else if(e.which === 27 && 
        document.querySelector("form").getAttribute("data-view") === "editor" &&
        document.fullscreenElement === null) {
        e.preventDefault();
        fix3p.editor.close();
        return true;
    }
});