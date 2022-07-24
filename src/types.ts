export interface Chart {
	id: string;
	position: Position;
	size: Size;
	scale: number;
	nodes: ChartNode[];
	links: Link[];
	selected?: Selected | null;
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
	position: Position;
	rendering: NodeStaticTextRendering | NodeDynamicTextRendering;
	readonly?: boolean;
	data?: unknown;
}

export interface Port {
	uuid: string;
	type: 'input' | 'output' | 'both';
	position: 'top' | 'bottom';
}

export interface Link {
	uuid: string;
	readonly?: boolean;
	start: {
		position?: Position;
		nodeUuid: string;
		portUuid: string;
	},
	end: {
		position?: Position;
		nodeUuid: string;
		portUuid: string;
	},
}

export interface InProgressLink {
	uuid: string;
	start: {
		position: Position;
		nodeUuid: string;
		portUuid: string;
	},
	end: {
		position: Position;
	},
}

export type TypedEvent<T> = Omit<Event, 'target'> & {
	target: T;
}

export type HTMLEvent = TypedEvent<HTMLElement>;

export interface Selected {
	type: "node" | "link";
	data: {
		uuid: string;
		readonly?: boolean;
	};
}

export interface Position {
	x: number;
	y: number;
}

export interface Size {
	width: number;
	height: number;
}
