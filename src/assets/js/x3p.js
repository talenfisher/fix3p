import saveAs from "file-saver";
import md5 from "blueimp-md5";
import { EventEmitter } from "events";
import GlScene from "gl-plot3d";
import SurfacePlot from "gl-surface3d";
import ndarray from "ndarray";

const REQUIRED_FILES = [
    "main.xml",
    "md5checksum.hex"
];

const DATA_TYPES = { 
    D: Float64Array, 
    F: Float32Array, 
    L: Int32Array,  
    I: Int16Array   
};  
   
const parser = new DOMParser();
 
export class X3PException {
    constructor(message) {
        this.message = message;
    }

    toString() {
        return this.message;
    }
};

/**
 * Holds the x3p file
 */
export default class X3P extends EventEmitter {

    /**
     * Constructs a new X3P object
     * @param {ZipFile} zipfile the zip file to hold
     * @param {string} filename the filename of the zip file
     */
    constructor(zipfile, filename) {
        super();
        this.zipfile = zipfile;
        this.filename = filename;
        this.setFolder();
        
        if(!this.hasRequiredFiles()) {
            throw new X3PException("File does not conform to ISO5436-2");
        }
        
        this.extract();
        this.on("extracted", () => {
            if(!this.hasValidChecksum()) console.error("Found invalid checksum");
            setTimeout(() => this.render(), 1000);
        });
    }

    async extract() {
        this.manifestSrc = await this.retrieve("main.xml");
        this.manifest = parser.parseFromString(this.manifestSrc, "application/xml");
        this.matrix = await this.retrieve("bindata/data.bin", "arraybuffer");
        this.actualChecksum = md5(this.manifestSrc);
        this.expectedChecksum = (await this.retrieve("md5checksum.hex")).trim();
        this.emit("extracted");
    }

    /**
     * Checks to see if the manifest is located within a directory 
     * inside the archive, stores the directory name if there is one
     */
    setFolder() {
        this.folder = "";

        let result = this.zipfile.file(/main\.xml$/g);
        if(result.length > 0 && result[0].name !== "main.xml") {
            this.folder = result[0].name.replace("main.xml", "");
        }
    }

    /**
     * Retrieves the contents of a file within the zip archive
     * @param {string} filename name of the file to retrieve
     * @return {string} the contents of the file
     */
    retrieve(filename, type = "text") {
        return this.zipfile.file(this.folder+filename).async(type);
    }

    /**
     * Updates the contents of a file within the zip archive
     * @param {string} filename name of the file to update
     * @param {string} contents contents to update the file with
     */
    update(filename, contents) {
        this.zipfile.file(this.folder+filename, contents);
    }

    /**
     * Downloads the zip file to the user's computer
     * @param {string} filename the filename to use
     */
    async download(filename = this.filename) {
        let blob = await this.zipfile.generateAsync({
            type: "blob",
            compression: "DEFLATE",
            compressionOptions: {
                level: 9
            }
        });

        saveAs(blob, filename);
    }

    /**
     * Check to see if the zip file meets the requirements (must contain main.xml and md5checksum.hex)
     */
    hasRequiredFiles() {
        for(let requirement of REQUIRED_FILES) {
            if(!Object.keys(this.zipfile.files).includes(this.folder+requirement)) {
                return false;
            }
        }
        
        return true; 
    }
 
    /** 
     * Check to see if the checksum of the x3p file is correct
     */
    hasValidChecksum() {
        if(typeof this.expectedChecksum === "undefined") return false;
        if(this.expectedChecksum.match(/\*main\.xml$/)) this.actualChecksum += " *main.xml";
        this.expectedChecksum === this.actualChecksum;
    }

    /**
     * Render a 3d model
     */
    async render() {
        if(typeof this.manifest === "undefined") {
            return this.on("extracted", this.render.bind(this));
        }
        
        let sizeX = parseInt(this.manifest.querySelector("Record3 MatrixDimension SizeX").innerHTML);
        let sizeY = parseInt(this.manifest.querySelector("Record3 MatrixDimension SizeY").innerHTML);
        let incrementX = parseFloat(this.manifest.querySelector("Record1 Axes CX Increment").innerHTML);
        let incrementY = parseFloat(this.manifest.querySelector("Record1 Axes CY Increment").innerHTML);
        let DataTypeX = DATA_TYPES[this.manifest.querySelector("Record1 Axes CX DataType").innerHTML];
        let DataTypeY = DATA_TYPES[this.manifest.querySelector("Record1 Axes CY DataType").innerHTML];
        let DataTypeZ = DATA_TYPES[this.manifest.querySelector("Record1 Axes CZ DataType").innerHTML];
        let matrixX = [];
        let matrixY = [];
        let matrixZ = new DataTypeZ(this.matrix);
        let maxZ = NaN;
        let yCount = -1;

        for(let i = 0; i < matrixZ.length; i++) {
            matrixX[i] = (i % sizeX) * incrementX;
            matrixY[i] = ((matrixX[i] === 0) ? ++yCount : yCount) * incrementY;

            if(isNaN(maxZ) && !isNaN(matrixZ[i])) maxZ = matrixZ[i] * 5;
            else if(maxZ < matrixZ[i]) maxZ = matrixZ[i] * 5;
            matrixZ[i] = matrixZ[i] * 5;
        }

        let coords = [
            ndarray(new DataTypeY(matrixY), [sizeY, sizeX]),
            ndarray(new DataTypeX(matrixX), [sizeY, sizeX]),
            ndarray(matrixZ, [sizeY, sizeX])
        ];

        let canvas = document.querySelector("#visual");
        let gl = canvas.getContext("webgl");

        canvas.setAttribute("width", canvas.offsetWidth);
        canvas.setAttribute("height", canvas.offsetHeight);
        gl.depthFunc(gl.LEQUAL);

        this.scene = GlScene({
            canvas,
            gl,
            pixelRatio: canvas.offsetWidth / canvas.offsetHeight,
            clearColor: [0,0,0,0],
            autoResize: false,
            camera: {
                eye: [0, 0, 1.4],
                up: [-1, 0, 0],
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
            field: coords[2],
            coords: coords,
            colormap: [
                {index: 0, rgb: [205,127,50]},
                {index: 1, rgb: [205,127,50]}
            ]
        }); 

        surface.ambientLight = 0.1;
        surface.diffuseLight = 0.4;
        surface.specularLight = 0.3; 
        surface.roughness = 0.5;
        surface.lightPosition = [ (sizeY * incrementY) / 2, sizeX * incrementX * -2, maxZ * 2 ];

        this.scene.add(surface);
        this.surface = surface; 
    }

    /**
     * Remove the render
     */
    destroy() {
        let canvas = document.querySelector("#visual");
        let gl = canvas.getContext("webgl");
        requestAnimationFrame(() => gl.clear(gl.DEPTH_BUFFER_BIT));
        this.scene.dispose();
    }
}  