// TODO rename these to better show what they actually do

function getCanvasZoom(canvas: HTMLElement, zoom: number) {
    let canvasWidthZoom = canvas.clientWidth / (canvas.clientWidth * zoom);
    canvasWidthZoom ||= 0;
    let canvasHeightZoom = canvas.clientHeight / (canvas.clientHeight * zoom);
    canvasHeightZoom ||= 0;

    return {
        canvasWidthZoom,
        canvasHeightZoom
    }
}

export function getPointerCoords(canvas: HTMLElement, event: PointerEvent, zoom: number) {
    const { canvasWidthZoom, canvasHeightZoom } = getCanvasZoom(canvas, zoom);
    const pointerX = event.clientX * (canvas.clientWidth / (canvas.clientWidth * zoom)) - (canvas.getBoundingClientRect().x * (canvasWidthZoom));
    const pointerY = event.clientY * (canvas.clientHeight / (canvas.clientHeight * zoom)) - (canvas.getBoundingClientRect().y * (canvasHeightZoom));

    return {
        pointerX,
        pointerY,
    }
}

export function getTransformedCoords(canvas: HTMLElement, x: number, y: number, zoom: number) {
    const { canvasWidthZoom, canvasHeightZoom } = getCanvasZoom(canvas, zoom);
    const transformedX = x * (canvas.clientWidth / (canvas.clientWidth * zoom)) - (canvas.getBoundingClientRect().x * (canvasWidthZoom));
    const transformedY = y * (canvas.clientHeight / (canvas.clientHeight * zoom)) - (canvas.getBoundingClientRect().y * (canvasHeightZoom));

    return {
        transformedX,
        transformedY,
    }
}

export function getPortCoords(canvas: HTMLElement, port: HTMLElement, zoom: number) {
    const { canvasWidthZoom, canvasHeightZoom } = getCanvasZoom(canvas, zoom);

	const portX = port.offsetWidth / 2 + (port.getBoundingClientRect().x - canvas.getBoundingClientRect().x) * canvasWidthZoom;
    const portY = port.offsetHeight / 2 + (port.getBoundingClientRect().y - canvas.getBoundingClientRect().y) * canvasHeightZoom;

    return {
        portX,
        portY,
    }
}
