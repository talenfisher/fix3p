import ZipHolder from "./zipholder";
import XMLBuilder from "./xmlbuilder";
import Uploader from "./uploader";

window.fix3p = {
    ZipHolder: new ZipHolder,
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
 * Convert manifest (main.xml) to a series of html inputs
 * 
 * @param {Manifest} manifest 
 * @param {Node} target 
 */

window.addEventListener("load", () => {
    new Uploader;
   
    // setup tabs
    document.addEventListener("click", e => {
        if(e.target.matches("a.tab")) {
            e.preventDefault();

            let builder = new XMLBuilder(document.querySelector(".view main"));
            fix3p.ZipHolder.update("main.xml", builder.toString());
            fix3p.ZipHolder.download();
            
        } else if(e.target.matches(".tab:not(a)")) {
            document.querySelector(".view").setAttribute("data-view", e.target.index());
        }
    });
});
