/**
 * Converts an rgb color string to a hexadecimal
 * 
 * @param rgb the rgb color value to convert
 * @return the converted hexadecimal value
 */
export function rgbToHex(rgb: string): string {
    if(!rgb || !rgb.match(/rgb\([0-9]+, [0-9]+, [0-9]+\)/g)) return rgb;
    
    let color = "#";
    rgb = rgb.replace("rgb(", "");
    rgb = rgb.replace(")", "");
    
    for(let component of rgb.split(",")) {
        component = component.trim();
        let hex = Number(component).toString(16);

        color += hex.length === 1 ? `0${hex}` : hex;
    }

    return color;
}