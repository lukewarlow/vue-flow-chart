<template>
	<draggable
		@wheel="wheel"
		@move="move"
		@moveend="moveEnd"
		:boundToCanvas="false"
		:x="chart.position.x"
		:y="chart.position.y"
		:style="{width: `${chart.size.width}px`, height: `${chart.size.height}px`}"
		class="bg-transparent border border-dashed border-gray-900 dark:border-gray-500"
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
		setup() {
			const { chart, canvas, inProgressLink } = useGlobalState();
			const { addToHistory } = useChartHistory();

			function zoom(amount: number) {
				if (canvas.value) {
					const scale = canvas.value.style.getPropertyValue('--tw-scale-x') || 1;
					const newScale = +scale + amount;
					if (newScale > 0.3) {
						chart.value.scale = newScale;
						addToHistory();
					}
				}
			}

			function setScale(amount: number) {
				if (canvas.value) {
					if (amount >= 0.5) {
						canvas.value.style.setProperty('--tw-scale-x', amount.toString());
						canvas.value.style.setProperty('--tw-scale-y', amount.toString());
					}
				}
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

			function move(data: any) {
				chart.value.position.x = data.x;
				chart.value.position.y = data.y;
			}

			function moveEnd() {
				addToHistory();
			}

			watch(chart, (newValue, oldValue) => {
				if (canvas.value) {
					setScale(newValue.scale);
				}
			}, {deep: true});

			onMounted(() => {
				setScale(chart.value.scale);
			});

			return {
				inProgressLink,
				chart,
				canvas,
				move,
				moveEnd,
				wheel,
			}
		}
	});
</script>
