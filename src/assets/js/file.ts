import { CustomElement } from "./decorators";


@CustomElement("file")
export default class File extends HTMLElement {
    private btn: HTMLElement;
    private input: HTMLInputElement;

    public connectedCallback() {
        this.innerHTML = `
            <div class="upload-btn">
                <input type="file">
                <span>Upload Preset</span>
            </div>
        `;

        this.btn = this.querySelector("span");
        this.input = this.querySelector("input");

        this.setupListeners();
    }

    private setupListeners() {
        this.btn.onclick = e => this.input.click();
    }
}