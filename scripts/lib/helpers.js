/**
 * Retrieves actors from the canvas tokens.
 * 
 * @returns {Array} An array of actors from the canvas tokens.
 */
export function getCanvasActors() {
    return canvas?.tokens?.placeables?.map(t => t?.actor).filter(Boolean) ?? [];
}