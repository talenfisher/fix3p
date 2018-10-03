import jszip from "jszip";
import ZipHolder from "./zipholder";
import EditableFields from "./editable-fields.json";

let parser = new DOMParser();
class X3PException {};

export default class Uploader {
    constructor() {
        this.label = document.querySelector(".upload label");
        this.input = document.querySelector(".upload input");
        this.setupListeners();
    }

    setupListeners() {
        let listener = e => e.preventDefault();
        for(let event of ["drag", "dragstart", "dragend", "dragover", "dragenter", "dragleave", "drop"]) {
            this.label.addEventListener(event, listener);
        }

        this.label.addEventListener("dragenter", () => this.label.classList.add("hover"));
        this.label.addEventListener("dragleave", () => this.label.classList.remove("hover"));
        this.label.addEventListener("drop", this.read);
        this.input.addEventListener("change", e => this.read(e, true));
    }

    /**
     * Read the file that was selected
     * 
     * @param {*} e 
     * @param {*} byclick 
     */
    async read(e, byclick = false) {
        this.label.classList.remove("hover");

        let file = (!byclick) ? e.originalEvent.dataTransfer.files[0] : this.input.files[0];
        let zip = await jszip().loadAsync(file);
        
        try {
            fix3p.ZipHolder = new ZipHolder(zip, file.name);
            if(!(await fix3p.ZipHolder.isValid())) {
                throw new X3PException();
            }

        } catch(x3pexception) {
            var error = document.querySelector(".error");
            error.innerHTML = "Please upload a valid X3P file.";
            error.classList.add("active");
            setTimeout(() => error.classList.remove("active"), 2000);
            this.input.value = "";
            return;
        }

        let manifest = await fix3p.ZipHolder.retrieve("main.xml");
        manifest = parser.parseFromString(manifest, "application/xml");

        switch(window.fix3p.mode) {
            case "development": 
                this.display(manifest.children[0]);
                break;

            default:
                this.populate(manifest.children[0]);
                break;
        }
        
        document.querySelector("form").style.right = "100vw";
    }

    /**
     * Populate existing HTML inputs with values
     * from the X3P file
     * 
     * @param {*} node 
     */
    populate(node) {
        if(node.children.length === 0) {
            let selector = pathArray2DTS(node.getPath());
            let el = document.querySelector(selector + " input");
            el.value = node.innerHTML;

        } else {
            for(let subchild of node.children) {
                this.populate(subchild);
            }
        }
    }

    display(manifest) {
        this.count = 0;
        document.querySelector(".view main").innerHTML = "";
        document.querySelector(".view nav").innerHTML = '<a href="#" class="tab"><i class="fas fa-download"></i> Download</a>';
        this.displayIterator(manifest, document.querySelector(".view main"));
    }

    /**
     * Dynamically populate the editor with what is in
     * the X3P file.  (Used in development to generate 
     * the "viewer" HTML tree in index.html)
     * 
     * @param {*} manifest 
     * @param {*} target 
     */
    displayIterator(manifest, target) {
        for(let child of manifest.children) {
            let el = document.createEasy("div", {
                attrs: { "data-tag": child.tagName } 
            });
            
            if(child.children.length > 0) {
                el = this.displayIterator(child, el);
    
                // record headings should be tabs instead
                if(!child.tagName.match(/^Record/g)) {
                    let heading = document.createEasy("h3", {
                        props: { innerHTML: prettyPrint(child.tagName) }
                    });
                
                    el.insertBefore(heading, el.children[0]);
    
                } else {
                    let tab = document.createEasy("div", {
                        props: { "innerHTML": prettyPrint(child.tagName) },
                        attrs: { "data-target": child.tagName },
                        classes: [ "tab" ]
                    });

                    target.parentElement.querySelector("nav").appendChild(tab);
                }
    
            } else {
                let label = document.createEasy("label", {
                    props: {
                        innerHTML: prettyPrint(child.tagName) + ":"
                    },
                    attrs: {
                        for: "x3p$"+this.count
                    }
                });

                let input = document.createEasy("input", {
                    props: {
                        type: "text",
                        value: child.innerHTML,
                        id: "x3p$"+this.count
                    }
                });    

                if(!EditableFields.includes(this.count)) input.setAttribute("disabled", "disabled");
                
                el.appendChild(label);
                el.appendChild(input);
                this.count++;
            }
    
            target.appendChild(el);
        }
    
        return target;
    }    

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