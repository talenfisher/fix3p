import { CustomElement } from "./decorators";

const THUMB_WIDTH = 30;

@CustomElement("slider")
export default class Slider extends HTMLElement {
    private track: HTMLElement;
    private thumb: HTMLElement;
    private active: boolean = false;
    private valueBefore?: number;

    connectedCallback() {
        this.track = this.createTrack();
        this.thumb = this.createThumb();

        this.track.appendChild(this.thumb);
        this.appendChild(this.track);
    }

    get width() {
        return this.track.offsetWidth - THUMB_WIDTH;
    }

    get value() {
        return this.thumb.offsetLeft / this.width;
    }
    
    set value(value: number) {
        let prevValue = this.value;
        value = Math.min(value, 1);
        value = Math.max(value, 0);
        
        this.thumb.style.left = `${value * this.width}px`;

        if(value !== prevValue) {
            this.dispatchEvent(new Event("change"));
        }
    }

    private createTrack() {
        let track = document.createElement("div");
        track.classList.add("slider-track");
        return track;
    }

    private createThumb() {
        let thumb = document.createElement("div");
        thumb.classList.add("slider-thumb");

        thumb.onmousedown = e => {
            this.active = true;
            this.valueBefore = this.value;
        };

        window.addEventListener("mousemove", e => {
            if(!this.active) return;
            let offset = e.clientX - this.track.offsetLeft;
            offset = Math.max(offset, 0);
            offset = Math.min(offset, this.width);

            thumb.style.left = `${offset}px`;
        });

        window.addEventListener("mouseup", () => {
            this.active = false;

            if(this.valueBefore != this.value) {
                this.dispatchEvent(new Event("change"));
            }
        });

        return thumb;
    }
}