/**
 * Converts a path array to a data tag selector
 * @param {string[]} path 
 */
window.pathArray2DTS = function(path) {
    let result = "main ";

    for(let tagname of path) {
        result += `[data-tag="${tagname}"] `
    }

    return result;
}

/**
 * Pretty print a string.. (CalibrationDate to Calibration Date)
 * @param {string} string 
 * @return {string} prettified version of the string parameter
 */
window.prettyPrint = function(string) {
    let result = "";

    for(let i = 0; i < string.length; i++) {
        if(i !== 0 && 
            string[i] === string[i].toUpperCase() && 
            string[i - 1] === string[i - 1].toLowerCase()) result += " "; // CX, CY don't get spaced

        result += string[i];
    }

    return result;
}