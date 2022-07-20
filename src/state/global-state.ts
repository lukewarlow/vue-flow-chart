import {computed, ref} from 'vue';
import {Chart, ChartNode, HTMLEvent, InProgressLink, Link} from "../types";

const selectedLink = ref<Link | null>(null);
const selectedNode = ref<ChartNode | null>(null);
const inProgressLink = ref<InProgressLink | null>(null);

const canvasRef = ref<HTMLElement>();

const scrollHandlers: Map<string, ((event: HTMLEvent) => void)> = new Map<string, (event: HTMLEvent) => void>();

const chart = ref<Chart>(emptyChart());

export default function useGlobalState() {
	const canvas = computed<HTMLElement|null>(() => {
		if (canvasRef.value) {
			return canvasRef.value.firstElementChild! as HTMLElement;
		} else {
			return null;
		}
	});

	return {
		inProgressLink,
		canvasRef,
		canvas,
		selectedLink,
		selectedNode,
		chart,
		scrollHandlers,
	}
}

function emptyChart(): Chart {
	return {
		id: crypto.randomUUID(),
		x: 0,
		y: 0,
		scale: 1,
		width: 3000,
		height: 3000,
		nodes: [],
		links: [],
	}
}
