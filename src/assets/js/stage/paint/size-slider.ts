import Session from "../../session";

interface SizeSliderOptions {
    el: HTMLInputElement;
    session: Session;
}


export default class SizeSlider {
    private el: HTMLInputElement;
    private session: Session;

    constructor(options: SizeSliderOptions) {
        this.el = options.el;
        this.session = options.session;

        this.setupListeners();
        this.session.on("render", this.reset.bind(this));
    }

    public reset() {
        if(!this.session.started) return;

        this.value = 0.15;
        this.updateBrushSize();
    }
    
    public get value() {
        // range inputs don't work with decimals, otherwise
        // I would just use 0/1 min/max attrs on the range element
        return (Number(this.el.value) / 100); 
    }

    public set value(value: number) {
        if(!this.session.started || value < 0 || value > 1) return;
        this.el.value = String(value * 100);
    }

    public get maxBrushSize() {
        if(!this.session.started) return 0;

        let { x, y } = this.session.x3p.axes;
        return (x.size / y.size) * 100;
    }

    private setupListeners() {
        this.el.onchange = this.updateBrushSize.bind(this);
    }

    private updateBrushSize() {
        if(!this.session.started) return;

        let brush = this.session.brush;
        brush.size = this.value * this.maxBrushSize;
    }
}