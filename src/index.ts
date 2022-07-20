import useGlobalState from "./state/global-state";
import {createApp, Ref} from 'vue';
import {Chart} from './types';
import DraggableCanvas from './components/DraggableCanvas.vue';
import './assets/styles/index.css';

export interface ChartOptions {
	rootElement?: HTMLElement;
}

export interface CreateChartReturn {
	configProxy: Ref<Chart>;
}

export function createChart(definition: Chart, options?: ChartOptions): CreateChartReturn {
	const { chart } = useGlobalState();
	options ??= {
		rootElement: document.body,
	};

	const app = createApp(DraggableCanvas);
	chart.value = definition;
	const foo = app.mount(options.rootElement!);

	return {
		configProxy: chart,
	};
}
