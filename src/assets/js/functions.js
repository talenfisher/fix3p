/**
 * This file contains miscellaneous functions
 */

function canvasToBlob(canvas) {
    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => resolve(blob), "image/jpeg");
    });
}