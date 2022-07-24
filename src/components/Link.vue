<template>
	<svg
		@pointerdown="pointerDown"
		:id="`link-${link.uuid}`"
		class="connection"
		:class="{'in-progress': inProgress, 'selected': selected?.data?.uuid === link.uuid}"
	>
		<path class="main-path" :d="curvature"></path>
		<path v-if="selected?.data?.uuid === link.uuid" class="selected-path" :d="curvature"></path>
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
			const { canvas, chart, selected } = useGlobalState();
			const { addToHistory } = useChartHistory();

			const curvature = computed(() => {
				if (!props.link.startX) {
					const startPort = document.querySelector<HTMLElement>(`#port-${props.link.startPortUuid}`)!;
					const endPort = document.querySelector<HTMLElement>(`#port-${props.link.endPortUuid}`)!;

					const { portX: startX, portY: startY } = getPortCoords(canvas.value!, startPort!, chart.value.scale);
					const { portX: endX, portY: endY } = getPortCoords(canvas.value!, endPort!, chart.value.scale);

					props.link.startX = startX;
					props.link.startY = startY;
					props.link.endX = endX;
					props.link.endY = endY;
				}
				return createCurvature(props.link.startX, props.link.startY!, props.link.endX!, props.link.endY!, 0.5);
			});

			// Click doesn't work here for some reason
			function pointerDown(event: PointerEvent) {
				if (event.pointerType === 'mouse' && event.button !== 0) {
					return;
				}

				if (!selected.value && !props.inProgress) {
					event.stopPropagation();
					selected.value = {
						type: "link",
						data: props.link,
					};
					window.addEventListener('keydown', keyDownHandler);
				}
			}

			watch(selected, (newValue) => {
				if (newValue === null) {
					window.removeEventListener('keydown', keyDownHandler);
				}
			});

			function keyDownHandler(event: KeyboardEvent) {
				if ((event.key === 'Delete' || event.key === 'Backspace') && selected.value?.type === 'link') {
					event.preventDefault();
					event.stopPropagation();
					const linkIndex = chart.value.links.findIndex((l) => l.uuid === selected.value!.data.uuid);
					chart.value.links.splice(linkIndex, 1);
					selected.value = null;
					addToHistory();
				}
			}

			onUnmounted(() => {
				window.removeEventListener('keydown', keyDownHandler);
			});

			return {
				selected,
				curvature,
				pointerDown,
			}
		}
	});

</script>
