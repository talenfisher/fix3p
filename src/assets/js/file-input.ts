import { CustomElement } from "./decorators";
import Popup from "./popup";

const _file = Symbol();

@CustomElement("file-input")
export default class FileInput extends HTMLElement {
    private uploadBtn: HTMLElement;
    private input: HTMLInputElement;
    private displayLabel: HTMLElement;
    private deleteBtn: HTMLElement;
    private changeListeners: CallableFunction[] = [];
    private [_file]: File;

    public connectedCallback() {
        if(!this.isConnected) return;

        this.innerHTML = `
            <div class="upload-btn">
                <input type="file" accept=".xml">
                <span>Upload Preset</span>
            </div>
            <div class="filename-viewer">
                <span class="text"></span>
                <span class="delete-btn fa fa-times"></span>
            </div>
        `;

        this.uploadBtn = this.querySelector(".upload-btn span");
        this.input = this.querySelector(".upload-btn input");
        this.displayLabel = this.querySelector(".filename-viewer .text");
        this.deleteBtn = this.querySelector(".filename-viewer .delete-btn");

        this.setupListeners();
    }

    private setupListeners() {
        this.uploadBtn.onclick = e => this.input.click();
        this.input.onchange = e => {
            e.stopPropagation();
            this.handleOnChange();
        }

        this.deleteBtn.onclick = e => {
            this.input.value = "";
            this.handleOnChange();
        }
    }

    private async handleOnChange() {
        if(this.input.files.length == 0) {
            this.file = null;
            return;
        }

        let file = this.input.files[0];
        let filename = file.name;
        
        if(!filename.match(/.xml$/)) {
            let popup = new Popup("Please upload an XML File.");
            popup.display(3, true);
            return;
        }

        this.file = file;
    }

    get file() {
        return this[_file];
    }

    set file(file: File) {
        let prev = this.file;
        this[_file] = file;

        (async () => {
            if(prev !== file) {
                let event = new Event("change", { cancelable: true });
                if(await this.dispatchEventAsync(event)) { // event was cancelled
                    return this[_file] = prev;
                }
            }

            if(file !== null) {    
                this.classList.add("active");
                this.displayLabel.innerHTML = file.name;
            } else {
                this.classList.remove("active");
            }
        })();
    }
}
