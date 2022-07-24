<template>
	<div
		ref="canvasRef"
		class="w-full h-full overflow-auto"
		@scroll.passive="scroll"
		@drop="drop"
		@dragenter.prevent
		@dragover.prevent
	>
		<draggable
			@wheel="wheel"
			@move="move"
			@moveend="moveEnd"
			:boundToCanvas="false"
			:x="chart.x"
			:y="chart.y"
			:style="{width: `${chart.width}px`, height: `${chart.height}px`}"
			class="bg-gray-50 dark:bg-gray-900"
		>
			<template v-if="canvas">
				<template v-for="node in chart.nodes" :key="node.uuid">
					<draggable-node :node="node" />
				</template>
				<template v-for="link in chart.links" :key="link.uuid">
					<default-link :link="link" />
				</template>
				<default-link :link="inProgressLink" :in-progress="true" v-if="inProgressLink" />
			</template>
		</draggable>
	</div>
</template>

<script lang="ts">
	import {defineComponent, onMounted, onUnmounted, watch} from 'vue';
	import useGlobalState from '../state/global-state';
	import {getTransformedCoords} from '../utils/coordinates';
	import Draggable from './Draggable.vue';
	import DraggableNode from './DraggableNode.vue';
	import {ChartNode, HTMLEvent} from '../types';
	import DefaultLink from './Link.vue';
	import {useChartHistory} from '../composables/use-chart-history';

	export default defineComponent({
		name: 'DraggableCanvas',
		components: {
			DefaultLink,
			Draggable,
			DraggableNode,
		},
		setup(props, ctx) {
			const { chart, canvasRef, canvas, scrollHandlers, inProgressLink } = useGlobalState();
			const { addToHistory, undoHistory, redoHistory } = useChartHistory();

			function zoom(amount: number) {
				if (canvas.value) {
					const scale = canvas.value.style.getPropertyValue('--tw-scale-x') || 1;
					const newScale = +scale + amount;
					if (newScale > 0.3) {
						// TODO re-enable once the issues have been fixed
						// chart.value.scale = newScale;
						// addToHistory();
					}
				}
			}

			function setScale(amount: number) {
				// TODO re-enable once the issues have been fixed
				// if (canvas.value) {
				// 	if (amount >= 0.3) {
				// 		canvas.value.style.setProperty('--tw-scale-x', amount.toString());
				// 		canvas.value.style.setProperty('--tw-scale-y', amount.toString());
				// 	}
				// }
			}

			function wheel(event: WheelEvent) {
				if (event.ctrlKey || event.metaKey) {
					event.preventDefault();
					event.stopPropagation();

					if (event.deltaY > 0) {
						zoom(-0.1);
					} else {
						zoom(0.1);
					}
				}
			}

			function scroll(event: HTMLEvent) {
				Array.from(scrollHandlers.values()).forEach((handler) => {
					handler(event);
				});
			}

			function move(data: any) {
				chart.value.x = data.x;
				chart.value.y = data.y;
			}

			function moveEnd() {
				addToHistory();
			}

			function drop(e: DragEvent) {
				if (canvasRef.value) {
					const newNodePartial = JSON.parse(e.dataTransfer!.getData("application/json"));

					const {transformedX, transformedY} = getTransformedCoords(canvas.value!, e.clientX, e.clientY, chart.value.scale);

					const newNode: ChartNode = {
						x: transformedX,
						y: transformedY,
						...newNodePartial
					}

					chart.value.nodes.push(newNode);
					addToHistory();
				}
			}

			function historyKeydownHandler(event: KeyboardEvent) {
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
			}

			watch(chart, (newValue, oldValue) => {
				if (canvas.value) {
					setScale(newValue.scale);
				}
			}, {deep: true});

			onMounted(() => {
				setScale(chart.value.scale);
				window.addEventListener('keydown', historyKeydownHandler);
			});

			onUnmounted(() => {
				window.removeEventListener('keydown', historyKeydownHandler);
			});

			return {
				inProgressLink,
				chart,
				canvasRef,
				canvas,
				move,
				moveEnd,
				scroll,
				drop,
				wheel,
			}
		}
	});
</script>
