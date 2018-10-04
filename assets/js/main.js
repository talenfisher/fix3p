import ZipHolder from "./zipholder";
import XMLBuilder from "./xmlbuilder";
import Uploader from "./uploader";
import Editor from "./editor";
import Popup from "./popup";
import md5 from "md5";
import axios from "axios";

window.fix3p = {
    extLoaded: false
};

/**
 * Queries only immediate children
 * @param {Node} query 
 */
Node.prototype.querySelectorImmediate = function(query) {
    for(var node of this.children) {
        if(node.matches(query)) return node;
    }
    
    return undefined;
}

/**
 * Gets the node's position relative to its siblings
 */
Node.prototype.index = function() {
    let parent = this.parentElement;
    let i = 0;

    for(let node of parent.children) {
        if(node === this) return i;
        i++;
    }
}

/**
 * Build fully qualified selector 
 */
Node.prototype.getPath = function() {
    let tagnames = [ this.tagName ];
    let parent = this.parentElement;

    while(parent !== this.ownerDocument.documentElement) {
        tagnames.push(parent.tagName);
        parent = parent.parentElement;
    }

    return tagnames.reverse();
}

/**
 * Easily create elements
 * 
 * @param {string} name 
 * @param {object} options 
 */
Document.prototype.createEasy = function(name, options = {}) {
    let el = this.createElement(name);

    if(typeof options.props !== "undefined") {
        for(let prop in options.props) {
            el[prop] = options.props[prop];
        }
    }
    
    if(typeof options.attrs !== "undefined") {
        for(let attr in options.attrs) {
            el.setAttribute(attr, options.attrs[attr]);
        }
    }

    if(typeof options.classes !== "undefined") {
        for(let className of options.classes) {
            el.classList.add(className);
        }
    }

    return el;
}


/**
 * Converts a path array to a data tag selector
 * @param {string[]} path 
 */
window.pathArray2DTS = function(path) {
    let result = "main ";

    for(let tagname of path) {
        result += `[data-tag="${tagname}"] `
    }

    return result;
}

/**
 * Pretty print a string.. (CalibrationDate to Calibration Date)
 * @param {string} string 
 * @return {string} prettified version of the string parameter
 */
window.prettyPrint = function(string) {
    let result = "";

    for(let i = 0; i < string.length; i++) {
        if(i !== 0 && 
            string[i] === string[i].toUpperCase() && 
            string[i - 1] === string[i - 1].toLowerCase()) result += " "; // CX, CY don't get spaced

        result += string[i];
    }

    return result;
}


if(typeof window.chrome.runtime.id !== "undefined") {
    fix3p.extLoaded = true;
}

/**
 * Convert manifest (main.xml) to a series of html inputs
 * 
 * @param {Manifest} manifest 
 * @param {Node} target 
 */

window.addEventListener("load", async () => {
    fix3p.uploader = new Uploader;
    fix3p.uploader.display();

    fix3p.editor = new Editor;

    let popup = new Popup("");
    try {
        
        let file = (new URLSearchParams(window.location.search)).get("file");
        
        if(file !== null) {
            popup.update("Reading file...");
            popup.display();

            let contents = (await axios.get(file, { responseType: "blob" })).data;
            fix3p.uploader.read({ dataTransfer: { files: [ new File([contents], "file.x3p") ] } });
            popup.hide(true);
        }

    } catch(exception) {
        popup.update("Error reading X3P file.");
        popup.display(2, true);
    }

    // setup tabs
    document.addEventListener("click", async e => {
        if(e.target.matches("a.tab")) {
            e.preventDefault();

            let builder = new XMLBuilder(document.querySelector(".view main"));
            let contents = builder.toString();
            fix3p.ZipHolder.update("main.xml", contents);
            fix3p.ZipHolder.update("md5checksum.hex", md5(contents)+" *main.xml");
            
            let popup = new Popup("Compressing...");
            popup.display();

            await fix3p.ZipHolder.download();
            popup.update(`Continue editing this file? <div class="popup-btns"><div id="continue-yes" class="popup-btn">Yes</div><div id="continue-no" class="popup-btn">No</div></div>`);
            
            popup.el.querySelector("#continue-yes").addEventListener("click", e => {
                popup.hide(true);
            });

            popup.el.querySelector("#continue-no").addEventListener("click", e => {
                popup.hide(true);
                fix3p.uploader.display();
            });

        } else if(e.target.matches(".tab:not(a)")) {
            document.querySelector(".view").setAttribute("data-view", e.target.index());
        }
    });
    
    
});

window.addEventListener("keydown", e => {
    if((e.ctrlKey || e.metaKey) && e.which === 83)  {
        if(document.querySelector("form").getAttribute("data-view") !== "editor") return true;
        e.preventDefault();
        document.querySelector("a.tab").click();
        return false;
    }
});