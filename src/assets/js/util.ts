/**
 * Miscellaneous utilities
 */

import X3P from "x3p.js";
import Color from "@talenfisher/color";

/**
 * Get a value from a header with several parts
 * ie Content-Disposition: attachment; filename="test.jpg"
 * 
 * @param header the header value
 * @param partname the part of the header to retrieve
 */
export function getHeaderPart(header: string, partname: string) {
    partname = partname.trim().toLowerCase();

    for(let part of header.split(";")) {
        let i = part.indexOf("=");

        if(i === -1) continue;

        let key = part.substring(0, i).trim().toLowerCase();
        let val = part.substring(i + 1);
        
        if(key.toLowerCase() === partname) {
            return val.replace(/\"/g, "");
        }
    }

    return null;
}

/**
 * Gets colors to show as annotations for an X3P in paint mode
 */
export function getX3pAnnotationColors(x3p: X3P): string[] {
    const mask = x3p.mask;
    const annotationColors = Object.keys(mask.annotations).map(hex => new Color(hex));
    const colors = new Set<string>();
    for(let color of [...annotationColors, ...mask.colors]) {
        colors.add(color.hex6);
    }
    return [...colors.values()].filter((color) => color !== mask.color);
}