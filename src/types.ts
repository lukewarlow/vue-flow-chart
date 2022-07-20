

export interface Chart {
	id: string;
	x: number;
	y: number;
	scale: number;
	width: number;
	height: number;
	nodes: ChartNode[];
	links: Link[];
}

export interface NodeRendering {

}

export interface NodeStaticTextRendering extends NodeRendering {
	text: string;
}

export interface NodeDynamicTextRendering extends NodeRendering {
	dynamicText: (node: ChartNode) => string;
}


export interface ChartNode {
	uuid: string;
	ports: Port[];
	x: number;
	y: number;
	rendering: NodeStaticTextRendering | NodeDynamicTextRendering;
	data?: unknown;
}

export interface Port {
	uuid: string;
	type: 'input' | 'output' | 'both';
}

export interface Link {
	uuid: string;
	startX?: number;
	startY?: number;
	endX?: number;
	endY?: number;
	startNodeUuid: string;
	startPortUuid: string;
	endNodeUuid: string;
	endPortUuid: string;
}

export interface InProgressLink {
	uuid: string;
	startX: number;
	startY: number;
	endX: number;
	endY: number;
	startNodeUuid: string;
	startPortUuid: string;
}



// TODO move these
export type TypedEvent<T> = Omit<Event, 'target'> & {
	target: T;
}

export type HTMLEvent = TypedEvent<HTMLElement>;
