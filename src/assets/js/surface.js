import ndarray from "ndarray";
import GlScene from "gl-plot3d";
import SurfacePlot from "gl-surface3d";

const DATA_TYPES = { 
    D: Float64Array, 
    F: Float32Array, 
    L: Int32Array,  
    I: Int16Array   
};

const EPSILON = 0.0001;
const MULTIPLY = 5;
const AXES = ["X","Y","Z"];
 
export default class Surface { 
    constructor({ manifest, data }) {
        this.manifest = manifest;
        this.data = data;
        this.canvas = document.querySelector("#visual");
        this.fullscreenBtn = document.querySelector(".stage i");

        this.setupFullscreen();
        this.setupSizes();
        this.setupIncrements();
        this.setupDataTypes();
        this.setupMaxes();
        this.setupCoords();
    }

    /**
     * Enters the canvas into fullscreen mode
     */
    setupFullscreen() {        
        if(this.canvas.requestFullScreen === null)  {
            this.fullscreenBtn.remove();
            return;
        }

        this.fullscreenBtn.onclick = () => this.canvas.requestFullscreen();
        this.canvas.addEventListener("fullscreenchange", this.fullscreenChangeHandler.bind(this));
    }

    fullscreenChangeHandler() {
        if(document.fullscreenEnabled) {
            this.canvas.setAttribute("data-height", this.canvas.getAttribute("height"));
            this.canvas.setAttribute("data-width", this.canvas.getAttribute("width"));
            this.canvas.setAttribute("height", this.canvas.offsetHeight);
            this.canvas.setAttribute("width", this.canvas.offsetWidth);
            this.scene.update({ pixelRatio: window.innerWidth / window.innerHeight });
        } else {
            this.canvas.setAttribute("height", this.canvas.getAttribute("data-height"));
            this.canvas.setAttribute("width", this.canvas.getAttribute("data-width"));
            this.scene.update({ pixelRatio: this.canvas.offsetWidth / this.canvas.offsetHeight });
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
            if(!dataType in DATA_TYPES) throw new Exception("X3P Manifest must include DataType");
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
        let gl = this.canvas.getContext("webgl");
        gl.depthFunc(gl.ALWAYS);

        this.canvas.setAttribute("width", this.canvas.offsetWidth);
        this.canvas.setAttribute("height", this.canvas.offsetHeight);
        
        this.scene = GlScene({
            canvas: this.canvas,
            gl,
            pixelRatio: this.canvas.offsetWidth / this.canvas.offsetHeight,
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

        let surface = SurfacePlot({
            gl: this.scene.gl,
            field: this.coords[2],
            coords: this.coords,
            colormap: [
                {index: 0, rgb: [205,127,50]},
                {index: 1, rgb: [205,127,50]}
            ]
        }); 

        surface.ambientLight = 0.1;
        surface.diffuseLight = 0.4;
        surface.specularLight = 0.3; 
        surface.roughness = 0.5;
        surface.lightPosition = [ (this.sizeY * this.incrementY) / 2, this.sizeX * this.incrementX * -2, this.maxZ * 2 ];

        requestAnimationFrame(() => this.scene.add(surface));
    }

    unrender() {
        let gl = this.canvas.getContext("webgl");
        requestAnimationFrame(() => gl.clear(gl.DEPTH_BUFFER_BIT));
        this.scene.dispose();
        this.canvas.removeEventListener("fullscreenchange", this.fullscreenChangeHandler.bind(this));
    }
}