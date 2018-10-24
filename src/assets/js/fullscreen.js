/**
 * Full screen utilities
 * Creates unprefixed versions of the fullscreen api methods
 */

Document.fullscreenEnabled = 
    Document.fullscreenEnabled || 
    Document.webkitFullscreenEnabled || 
    Document.mozFullscreenEnabled || 
    false;

Element.prototype.requestFullScreen = 
    Element.prototype.requestFullScreen || 
    Element.prototype.webkitRequestFullScreen || 
    Element.prototype.mozRequestFullScreen ||
    null;

Document.prototype.exitFullscreen = 
    Document.prototype.exitFullscreen ||
    Document.prototype.webkitExitFullscreen ||
    Document.prototype.mozRequestFullScreen ||
    null;