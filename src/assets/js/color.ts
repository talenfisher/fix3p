export function rgbToHex(rgb: string) {
    if(!rgb.match(/rgb\([0-9]+, [0-9]+, [0-9]+\)/g)) return rgb;
    
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