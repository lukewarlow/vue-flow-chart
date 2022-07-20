import {computed, ref, toRaw} from 'vue';
import useGlobalState from '../state/global-state';
import {Chart} from '../types';
import equal from 'fast-deep-equal';

interface ChartHistory {
    entries: Chart[];
    currentIndex: number;
}

const historyLimit = 50;

const history = ref<ChartHistory>({
    entries: [],
    currentIndex: -1,
});

export function useChartHistory() {
    const {chart} = useGlobalState();

    function addToHistory() {
        const newVal = structuredClone(toRaw(chart.value));
        if (equal(history.value.entries.at(-1), newVal)) {
            return;
        }

        let newIndex = history.value.currentIndex + 1;

        // Drop the redo items if starting a new history branch
        if (history.value.entries.length > newIndex) {
            history.value.entries.splice(newIndex);
        }

        if (history.value.entries.length === historyLimit) {
            history.value.entries.shift();
            newIndex = history.value.currentIndex;
        }

        history.value.currentIndex = newIndex;
        history.value.entries.push(newVal);
    }

    const canUndo = computed(() => history.value.currentIndex > 0);
    const canRedo = computed(() => history.value.entries.length > (history.value.currentIndex + 1));

    function undoHistory() {
        if (!canUndo.value) {
            return;
        }

        const newIndex = history.value.currentIndex - 1;
        const newValue = history.value.entries[newIndex];
        chart.value = structuredClone(toRaw(newValue));
        history.value.currentIndex = newIndex;
    }

    function redoHistory() {
        if (!canRedo.value) {
            return;
        }

        const newValue = history.value.entries[history.value.currentIndex + 1];
        chart.value = structuredClone(toRaw(newValue));
        history.value.currentIndex += 1;
    }

    return {
        addToHistory,
        undoHistory,
        redoHistory,
        canUndo,
        canRedo,
    };
}
