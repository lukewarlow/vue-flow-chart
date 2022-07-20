// Based on code from Drawflow
export function createCurvature(startPosX: number, startPosY: number, endPosX: number, endPosY: number, curvature: number) {
	let hx1;
	let hx2;
	if (startPosX >= endPosX) {
		hx1 = startPosX + Math.abs(endPosX - startPosX) * (curvature * -1);
		hx2 = endPosX - Math.abs(endPosX - startPosX) * (curvature * -1);
	} else {
		hx1 = startPosX + Math.abs(endPosX - startPosX) * curvature;
		hx2 = endPosX - Math.abs(endPosX - startPosX) * curvature;
	}
	return ` M ${startPosX} ${startPosY} C ${hx1} ${startPosY} ${hx2} ${endPosY} ${endPosX} ${endPosY}`;
}
