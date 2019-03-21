import "@babel/polyfill";

const CHECKBOXES = [
    "reporting"
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
        console.log(el);
    }
}();