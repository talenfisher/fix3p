import "@babel/polyfill";
import "@webcomponents/webcomponentsjs";
import "./slider";
import "./file-input";

import Slider from "./slider";

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
}();