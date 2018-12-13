import ndarray from "ndarray";
import Scene from "@talenfisher/gl-plot3d";
import SurfacePlot from "gl-textured-surface3d";
import { Canvas, Brush } from "@talenfisher/canvas";

const DATA_TYPES = { 
    D: Float64Array, 
    F: Float32Array, 
    L: Int32Array,  
    I: Int16Array   
};

const EPSILON = 0.0001;
const MULTIPLY = 5;
const AXES = ["X","Y","Z"];

interface RendererParameters {
    manifest: Document;
    data: any;
    texture?: HTMLImageElement;
}

export default class Renderer { 
    private manifest: Document;
    private data: any;
    private canvas: HTMLCanvasElement;
    private stage: HTMLElement;
    private fullscreenBtn: HTMLElement;
    private paintBtn: HTMLElement;
    private texture: Canvas;
    private gl: WebGLRenderingContext;
    private scene: Scene;
    private brush: Brush;
    private surface: SurfacePlot;
    private coords: Array<ndarray>;
    private sizeY: number;
    private sizeX: number;
    private maxX: number;
    private maxY: number;
    private maxZ: number;
    private incrementX: number;
    private incrementY: number;
    private dataTypeX: any;
    private dataTypeY: any;
    private dataTypeZ: any;

    constructor({ manifest, data, texture }: RendererParameters) {
        this.manifest = manifest;
        this.data = data;
        this.canvas = document.querySelector("#visual");
        this.stage = document.querySelector(".stage");
        this.fullscreenBtn = document.querySelector(".stage .fa-expand");
        this.paintBtn = document.querySelector(".fa-paint-brush");

        this.setupPaintbrush();
        this.setupFullscreen();
        this.setupSizes();
        this.setupIncrements();
        this.setupDataTypes();
        this.setupMaxes();
        this.setupCoords();

        this.texture = new Canvas({ width: this.sizeY, height: this.sizeX });
        
        if(texture) {
            this.texture.drawImage(texture);
        } else {
            this.texture.clear("#cd7f32");
        }
    }

    setupPaintbrush() {
        (<HTMLElement>this.paintBtn).onclick = () => {
            let classList = this.paintBtn.classList;
            classList.toggle("active");
            this.scene.camera.rotateSpeed = classList.contains("active") ? 0 : 1;
        };
    }

    /**
     * Enters the canvas into fullscreen mode
     */
    setupFullscreen() {        
        //@ts-ignore
        if(this.canvas.requestFullScreen === null)  {
            this.fullscreenBtn.remove();
            return;
        }

        this.fullscreenBtn.onclick = () => {
            let classList = this.fullscreenBtn.classList;

            //@ts-ignore
            if(document.fullscreenElement == null) {
                this.stage.requestFullscreen();
                classList.add("active");
            } else {
                document.exitFullscreen();
                classList.remove("active");
            }
        };

        this.stage.addEventListener("fullscreenchange", this.fullscreenChangeHandler.bind(this));
    }

    fullscreenChangeHandler() {
        this.canvas.setAttribute("height", this.canvas.offsetHeight.toString());
        this.canvas.setAttribute("width", this.canvas.offsetWidth.toString());
        this.scene.update({ pixelRatio: this.canvas.width / this.canvas.height });

        //@ts-ignore
        if(this.fullscreenBtn.classList.contains("active") && document.fullscreenElement == null) {
            this.fullscreenBtn.classList.remove("active");
        }
    }

    setupSizes() {
        for(let axis of AXES) {
            this["size"+axis] = this.manifest.getInt(`Record3 MatrixDimension Size${axis}`);
        }
    }

    setupIncrements() {
        for(let axis of AXES) {
            this["increment"+axis] = this.manifest.getFloat(`Record1 Axes C${axis} Increment`) / EPSILON;
        }
    }

    setupDataTypes() {
        for(let axis of AXES) {
            let dataType = this.manifest.get(`Record1 Axes C${axis} DataType`);
            if(!((<string> dataType) in DATA_TYPES)) throw new Error("X3P Manifest must include DataType");
            this["dataType"+axis] = DATA_TYPES[dataType];
        }
    }

    setupMaxes() {
        this.maxX = this.sizeX * this.incrementX;
        this.maxY = this.sizeY * this.incrementY;
        this.maxZ = NaN;
    }

    setupCoords() {
        let 
            x = [], 
            y = [], 
            z = new this.dataTypeZ(this.data),
            yCount = -1;

        for(let i = 0; i < z.length; i++) {
            x[i] = (i % this.sizeX) * this.incrementX;
            y[i] = ((x[i] === 0) ? ++yCount : yCount) * this.incrementY;
            z[i] = (z[i] / EPSILON) * MULTIPLY;

            // EPSILON MaxZ
            if(isNaN(this.maxZ) && !isNaN(z[i])) this.maxZ = z[i];
            else if(this.maxZ < z[i]) this.maxZ = z[i];
        }

        this.coords = [
            ndarray(new this.dataTypeX(x), [ this.sizeY, this.sizeX ]),
            ndarray(new this.dataTypeY(y), [ this.sizeY, this.sizeX ]),
            ndarray(z, [ this.sizeY, this.sizeX ])
        ];

        
    }

    render() {
        let gl = this.gl = this.canvas.getContext("webgl");
        gl.depthFunc(gl.ALWAYS);

        this.canvas.setAttribute("width", this.canvas.offsetWidth.toString());
        this.canvas.setAttribute("height", this.canvas.offsetHeight.toString());

        this.scene = Scene({
            canvas: this.canvas,
            gl,
            pixelRatio: 1,
            autoResize: false,
            camera: {
                eye: [0, 0, 1.4],
                up: [0, 0, 0],
                zoomMax: 1.7
            },
            axes: {
                gridEnable: false,
                lineEnable: false,
                tickEnable: false,
                labelEnable: false,
                zeroEnable: false
            }
        });

        let surface = this.surface = SurfacePlot({
            gl: this.scene.gl,
            field: this.coords[2],
            coords: this.coords,
            texture: this.texture.el
        });

        surface.ambientLight = 0.1;
        surface.diffuseLight = 0.4;
        surface.specularLight = 0.3; 
        surface.roughness = 0.5;
        surface.lightPosition = [ (this.sizeY * this.incrementY) / 2, this.sizeX * this.incrementX * -2, this.maxZ * 2 ];

        this.scene.add(surface);
        this.setupBrush();

        window.addEventListener("resize", e => {
            this.canvas.setAttribute("width", this.canvas.offsetWidth.toString());
            this.canvas.setAttribute("height", this.canvas.offsetHeight.toString());
            this.scene.update({ pixelRatio: this.canvas.width / this.canvas.height });
        })
    }

    setupBrush() {
        this.brush = new Brush({ canvas: this.texture, size: 30, nolisteners: true });
        this.canvas.addEventListener("mousedown", this.mouseDown.bind(this));
        this.canvas.addEventListener("mousemove", this.mouseMove.bind(this));
        this.canvas.addEventListener("mouseup", this.mouseUp.bind(this));
    }

    mouseDown(e) {
        if(!this.paintBtn.classList.contains("active") || 
        !this.scene.selection.data) return;

        let coords = this.scene.selection.data.index;
        this.brush.begin(coords[0], coords[1]);
        this.surface._colorMap.setPixels(this.texture.el);
    }

    mouseMove(e) {
        //@ts-ignore
        if(!this.paintBtn.classList.contains("active") || !this.brush.active) return;

        let coords = this.scene.selection.data.index;
        this.brush.move(coords[0], coords[1]);
        this.surface._colorMap.setPixels(this.texture.el);
    }

    mouseUp(e) {
        //@ts-ignore
        if(!this.paintBtn.classList.contains("active") || !this.brush.active) return;
        
        let coords = this.scene.selection.data.index;
        this.brush.end(coords[0], coords[1]);
        this.surface._colorMap.setPixels(this.texture.el);
    }

    unrender() {
        let gl = this.canvas.getContext("webgl");
        requestAnimationFrame(() => gl.clear(gl.DEPTH_BUFFER_BIT));
        this.scene.dispose();

        this.paintBtn.classList.remove("active");

        this.canvas.removeEventListener("fullscreenchange", this.fullscreenChangeHandler.bind(this));
        this.canvas.removeEventListener("mousedown", this.mouseDown.bind(this));
        this.canvas.removeEventListener("mouseup", this.mouseUp.bind(this));
        this.canvas.removeEventListener("mousemove", this.mouseMove.bind(this));
    }
}