import useGlobalState from "./state/global-state";
import {createApp, Ref} from 'vue';
import {Chart} from './types';
import ChartContainer from './components/ChartContainer.vue';
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

	const app = createApp(ChartContainer);
	chart.value = definition;
	addToHistory();
	app.mount(options.rootElement!);

	return {
		configProxy: chart,
	};
}
