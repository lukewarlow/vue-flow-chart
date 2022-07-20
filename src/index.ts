import useGlobalState from "./state/global-state";
import {createApp, Ref} from 'vue';
import {Chart} from './types';
import DraggableCanvas from './components/DraggableCanvas.vue';
import './assets/styles/index.css';
import {useChartHistory} from './composables/use-chart-history';

export interface ChartOptions {
	rootElement?: HTMLElement;
}

export interface CreateChartReturn {
	configProxy: Ref<Chart>;
}

export function createChart(definition: Chart, options?: ChartOptions): CreateChartReturn {
	const { chart } = useGlobalState();
	const { addToHistory } = useChartHistory();
	options ??= {
		rootElement: document.body,
	};

	const app = createApp(DraggableCanvas);
	chart.value = definition;
	addToHistory();
	app.mount(options.rootElement!);

	return {
		configProxy: chart,
	};
}
