<template>
	<div
		ref="canvasRef"
		class="w-full h-full bg-gray-50 dark:bg-gray-900 overflow-auto cursor-not-allowed chart"
		@scroll.passive="scroll"
		@drop="drop"
		@dragenter.prevent
		@dragover.prevent
	>
		<draggable-canvas />
	</div>
</template>

<script lang="ts">
	import {defineComponent, onMounted, onUnmounted} from 'vue';
	import useGlobalState from '../state/global-state';
	import {getTransformedCoords} from '../utils/coordinates';
	import DraggableCanvas from './DraggableCanvas.vue';
	import {ChartNode, HTMLEvent} from '../types';
	import {useChartHistory} from '../composables/use-chart-history';

	export default defineComponent({
		name: 'ChartContainer',
		components: {
			DraggableCanvas,
		},
		setup() {
			const { chart, canvasRef, canvas, scrollHandlers } = useGlobalState();
			const { addToHistory, undoHistory, redoHistory } = useChartHistory();

			function scroll(event: HTMLEvent) {
				Array.from(scrollHandlers.values()).forEach((handler) => {
					handler(event);
				});
			}

			function drop(e: DragEvent) {
				if (canvasRef.value) {
					const newNodePartial = JSON.parse(e.dataTransfer!.getData("application/json"));

					const {transformedX, transformedY} = getTransformedCoords(canvas.value!, e.clientX, e.clientY, chart.value.scale);

					const newNode: ChartNode = {
						position: {
							x: transformedX,
							y: transformedY,
						},
						...newNodePartial
					}

					chart.value.nodes.push(newNode);
					addToHistory();
				}
			}

			function keydownHandler(event: KeyboardEvent) {
				const isCmdCtrl = (event.ctrlKey || event.metaKey);

				if (isCmdCtrl && (event.key === 'y' || (event.shiftKey && event.key === 'z'))) {
					event.preventDefault();
					redoHistory();
					return;
				}
				if (isCmdCtrl && event.key === 'z') {
					event.preventDefault();
					undoHistory();
					return;
				}

				if (chart.value.selected && (event.key === 'Backspace' || event.key === 'Delete')) {
					event.preventDefault();

					if (!chart.value.selected.data.readonly) {
						if (chart.value.selected.type === 'node') {
							const nodeIndex = chart.value.nodes.findIndex((n) => n.uuid === chart.value.selected!.data.uuid);
							chart.value.nodes.splice(nodeIndex, 1);

							const outgoingLinks = chart.value.links.filter((link) => link.start.nodeUuid === chart.value.selected!.data.uuid);
							outgoingLinks.forEach((link) => {
								const index = chart.value.links.findIndex((l) => l.uuid === link.uuid);
								chart.value.links.splice(index, 1);
							});

							const incomingLinks = chart.value.links.filter((link) => link.end.nodeUuid === chart.value.selected!.data.uuid);
							incomingLinks.forEach((link) => {
								const index = chart.value.links.findIndex((l) => l.uuid === link.uuid);
								chart.value.links.splice(index, 1);
							});

							chart.value.selected = null;
							addToHistory();
						} else if (chart.value.selected?.type === 'link') {
							const linkIndex = chart.value.links.findIndex((l) => l.uuid === chart.value.selected!.data.uuid);
							chart.value.links.splice(linkIndex, 1);
							chart.value.selected = null;
							addToHistory();
						}
					}
				}
			}

			onMounted(() => {
				window.addEventListener('keydown', keydownHandler);
			});

			onUnmounted(() => {
				window.removeEventListener('keydown', keydownHandler);
			});

			return {
				canvasRef,
				scroll,
				drop,
			}
		}
	});
</script>
