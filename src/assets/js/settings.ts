import "@babel/polyfill";
import "@webcomponents/webcomponentsjs";

import "./dom/setup";
import "./slider";
import "./file-input";

import { Mask } from "x3p.js";
import Slider from "./slider";
import FileInput from "./file-input";
import Popup from "./popup";

const CHECKBOXES = [
    "reporting"
];

const SLIDERS = [
    "decimation"
];

interface CheckboxSettingOptions {
    el: HTMLInputElement;
}

class CheckboxSetting {
    private el: HTMLInputElement;

    constructor(options: CheckboxSettingOptions) {
        this.el = options.el;
        this.setupListeners();
        this.el.checked = localStorage.getItem(this.el.id) === "on" ? true : false;
    }

    private setupListeners() {
        this.el.onchange = () => {
            localStorage.setItem(this.el.id, this.el.checked ? "on" : "off");
        };
    }
}

function readFile(file: File): Promise<string> {
    if(typeof file === "undefined" || file === null) return null;

    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onerror = e => reject(e);
        reader.onload = e => resolve(e.target.result as string);
        reader.readAsText(file);
    });
}

void function setup() {
    for(let checkbox of CHECKBOXES) {
        let el = document.getElementById(checkbox);

        if(!(el instanceof HTMLInputElement)) return;
        new CheckboxSetting({ el });
    }

    for(let slider of SLIDERS) {
        let el = document.getElementById(slider) as Slider;
        el.value = Number(localStorage.getItem(slider));

        el.onchange = function() {
            localStorage.setItem(slider, el.value.toString());
        }
    }

    /**
     * Annotation Preset Uploader
     */

    let annotationPresetKey = "annotation-preset";
    let annotationPresetNameKey = "annotation-preset-filename";
    let annotationPresetValue = localStorage.getItem(annotationPresetKey);
    let annotationPresetNameValue = localStorage.getItem(annotationPresetNameKey);
    let uploadPresetBtn = document.getElementById("annotation-preset") as FileInput;
    
    uploadPresetBtn.addEventListener("change", async function(e) {
        let fileInput = this as FileInput;

        let file = fileInput.file || null;
        let fileName = file === null ? null : file.name;
        let xml = await readFile(file);
        
        if(file !== null && !Mask.isValidMask(xml)) {
            e.preventDefault();

            let popup = new Popup("Please upload a valid mask file.");
            popup.display(5, true);
            
            xml = null;
            fileName = null;
        }

        if(xml === null) {
            localStorage.removeItem(annotationPresetKey);
            localStorage.removeItem(annotationPresetNameKey);
            return;
        }

        localStorage.setItem(annotationPresetKey, xml);
        localStorage.setItem(annotationPresetNameKey, fileName);
    });

    if(annotationPresetNameValue != null) {
        uploadPresetBtn.file = new File([annotationPresetValue], annotationPresetNameValue);
    }
}();