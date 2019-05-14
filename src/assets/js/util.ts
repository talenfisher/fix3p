/**
 * Miscellaneous utilities
 */

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