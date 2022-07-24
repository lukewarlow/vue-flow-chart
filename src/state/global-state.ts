import {computed, ref} from 'vue';
import {Chart, HTMLEvent, InProgressLink} from "../types";

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
		chart,
		scrollHandlers,
	}
}

function emptyChart(): Chart {
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
		nodes: [],
		links: [],
	}
}
