import {Chart, ChartNode} from "./types";
import {createChart} from "./index";

function initialChart(): Chart {
	const nodes: ChartNode[] = [
		{
			uuid: crypto.randomUUID(),
			ports: [
				{
					uuid: crypto.randomUUID(),
					type: 'output',
				},
			],
			position: {
				x: 25,
				y: 25,
			},
			readonly: true,
			rendering: {
				text: 'Start Node',
			}
		},
		{
			uuid: crypto.randomUUID(),
			ports: [
				{
					uuid: crypto.randomUUID(),
					type: 'both',
				},
				{
					uuid: crypto.randomUUID(),
					type: 'input',
				},
				{
					uuid: crypto.randomUUID(),
					type: 'output',
				},
			],
			position: {
				x: 993,
				y: 81,
			},
			rendering: {
				text: 'Node fee',
			}
		},
		{
			uuid: crypto.randomUUID(),
			ports: [
				{
					uuid: crypto.randomUUID(),
					type: 'both',
				},
			],
			position: {
				x: 447,
				y: 120,
			},
			rendering: {
				text: 'Node fi'
			},
			data: {
				arbitraryData: true,
			}
		},
		{
			uuid: crypto.randomUUID(),
			ports: [
				{
					uuid: crypto.randomUUID(),
					type: 'input',
				},
				{
					uuid: crypto.randomUUID(),
					type: 'output',
				},
			],
			position: {
				x: 313,
				y: 422,
			},
			rendering: {
				text: 'Node fo',
			}
		}
	];

	return {
		id: crypto.randomUUID(),
		position: {
			x: 0,
			y: 0,
		},
		scale: 1,
		size: {
			width: 3000,
			height: 3000,
		},
		nodes,
		links: [
			{
				uuid: crypto.randomUUID(),
				readonly: true,
				start: {
					nodeUuid: nodes[1].uuid,
					portUuid: nodes[1].ports[0].uuid,
				},
				end: {
					nodeUuid: nodes[2].uuid,
					portUuid: nodes[2].ports[0].uuid,
				},
			}
		],
	}
}

const {configProxy} = createChart(initialChart(), {
	rootElement: document.querySelector<HTMLElement>('#foo')!
});

// @ts-ignore
window.configProxy = configProxy;

// element.addEventListener('update', (event) => {
// 	console.log(event);
// });

document.querySelector<HTMLElement>('#random-node')!.ondragstart = (e) => {
	const dataTransfer = e.dataTransfer!;

	dataTransfer.dropEffect = "move";
	dataTransfer.effectAllowed = "move";

	dataTransfer.setData("application/json", JSON.stringify({
		uuid: crypto.randomUUID(),
		ports: [
			{
				uuid: crypto.randomUUID(),
				type: 'input',
			},
			{
				uuid: crypto.randomUUID(),
				type: 'output',
			}
		],
		rendering: {
			text: 'foo',
		},
	}));
}
