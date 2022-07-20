import {Chart, ChartNode} from "./types";
import {createChart} from "./index";

function initialChart(): Chart {
	const nodes: ChartNode[] = [
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
			x: 993,
			y: 81,
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
			x: 447,
			y: 120,
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
			x: 313,
			y: 422,
			rendering: {
				text: 'Node fo',
			}
		}
	];

	return {
		id: crypto.randomUUID(),
		x: 0,
		y: 0,
		scale: 1,
		width: 3000,
		height: 3000,
		nodes,
		links: [
			{
				uuid: crypto.randomUUID(),
				startNodeUuid: nodes[0].uuid,
				startPortUuid: nodes[0].ports[0].uuid,
				endNodeUuid: nodes[1].uuid,
				endPortUuid: nodes[1].ports[0].uuid,
			}
		],
	}
}

const {configProxy} = createChart(initialChart(), {
	rootElement: document.querySelector<HTMLElement>('#foo')!
});

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
