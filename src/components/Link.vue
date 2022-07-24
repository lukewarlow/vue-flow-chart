<template>
	<svg
		@pointerdown="pointerDown"
		:id="`link-${link.uuid}`"
		class="connection"
		:class="{'in-progress': inProgress, 'selected': chart.selected?.data?.uuid === link.uuid}"
	>
		<path class="main-path" :d="curvature"></path>
		<path v-show="chart.selected?.data?.uuid === link.uuid" class="selected-path" :d="curvature"></path>
	</svg>
</template>

<script lang="ts">
	import {computed, defineComponent, onUnmounted, PropType, reactive, ref, watch} from 'vue';
	import useGlobalState from '../state/global-state';
	import {getPointerCoords, getPortCoords} from '../utils/coordinates';
	import {createCurvature} from '../utils/svg';
	import {Link} from '../types';
	import {useChartHistory} from '../composables/use-chart-history';

	export default defineComponent({
		name: 'DefaultLink',
		props: {
			link: {
				type: Object as PropType<Link>,
				required: true,
			},
			inProgress: {
				type: Boolean,
				default: false,
			}
		},
		setup(props) {
			const { canvas, chart } = useGlobalState();

			const curvature = computed(() => {
				if (!props.link.start.position || !props.link.end.position) {
					const startPort = document.querySelector<HTMLElement>(`#port-${props.link.start.portUuid}`)!;
					const endPort = document.querySelector<HTMLElement>(`#port-${props.link.end.portUuid}`)!;

					const { portX: startX, portY: startY } = getPortCoords(canvas.value!, startPort, chart.value.scale);
					const { portX: endX, portY: endY } = getPortCoords(canvas.value!, endPort, chart.value.scale);

					props.link.start.position = {
						x: startX,
						y: startY,
					};
					props.link.end.position = {
						x: endX,
						y: endY,
					};
				}
				return createCurvature(props.link.start.position.x, props.link.start.position.y, props.link.end.position.x, props.link.end.position.y, 0.5);
			});

			// Click doesn't work here for some reason
			function pointerDown(event: PointerEvent) {
				if (event.pointerType === 'mouse' && event.button !== 0) {
					return;
				}

				if (!chart.value.selected && !props.inProgress) {
					event.stopPropagation();
					chart.value.selected = {
						type: "link",
						data: {
							uuid: props.link.uuid,
							readonly: props.link.readonly
						},
					};
				}
			}

			return {
				chart,
				curvature,
				pointerDown,
			}
		}
	});

</script>
