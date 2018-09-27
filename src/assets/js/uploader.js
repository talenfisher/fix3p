import jszip from "jszip";

let parser = new DOMParser();

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

    read(e, byclick = false) {
        this.label.classList.remove("hover");

        var file = (!byclick) ? e.originalEvent.dataTransfer.files[0] : this.input.files[0];
        fix3p.ZipHolder.filename = file.name;

        jszip()
        .loadAsync(file)
        .then(zip => {
            fix3p.ZipHolder.zipfile = zip;

            zip
            .file("main.xml")
            .async("text")
            .then(manifest => {
                manifest = parser.parseFromString(manifest, "text/xml");
                this.display(manifest.children[0], document.querySelector(".view main"));
                document.querySelector("form").style.right = "100vw";
            });
        })
        .catch(err => console.error(err));
    }

    display(manifest, target) {
        for(let child of manifest.children) {
            let el = document.createEasy("div", {
                attrs: { "data-tag": child.tagName } 
            });
            
            if(child.children.length > 0) {
                el = this.display(child, el);
    
                // record headings should be tabs instead
                if(!child.tagName.match(/^Record/g)) {
                    let heading = document.createEasy("h3", {
                        props: { innerHTML: child.tagName }
                    });
                
                    el.insertBefore(heading, el.children[0]);
    
                } else {
                    let tab = document.createEasy("div", {
                        props: { "innerHTML": child.tagName },
                        attrs: { "data-target": child.tagName },
                        classes: [ "tab" ]
                    });

                    target.parentElement.querySelector("nav").appendChild(tab);
                }
    
            } else {
                let label = document.createEasy("label", {
                    props: {
                        for: child.tagName,
                        innerHTML: child.tagName + ":"
                    }
                });

                let input = document.createEasy("input", {
                    props: {
                        id: child.tagName,
                        type: "text",
                        value: child.innerHTML
                    }
                });    
                
                el.appendChild(label);
                el.appendChild(input);
            }
    
            target.appendChild(el);
        }
    
        return target;
    }    

}