<template>
	<svg
		@pointerdown="pointerDown"
		:id="`link-${link.uuid}`"
		class="connection"
		:class="{'in-progress': inProgress, 'selected': selectedLink?.uuid === link.uuid}"
	>
		<path class="main-path" :d="curvature"></path>
		<path v-if="selectedLink?.uuid === link.uuid" class="selected-path" :d="curvature"></path>
	</svg>
</template>

<script lang="ts">
	import {computed, defineComponent, onUnmounted, PropType, reactive, ref} from 'vue';
	import useGlobalState from '../state/global-state';
	import {getPointerCoords, getPortCoords} from '../utils/coordinates';
	import {createCurvature} from '../utils/svg';
	import {Link} from '../types';

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
			const { canvas, chart, selectedLink } = useGlobalState();

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

				if (!selectedLink.value && !props.inProgress) {
					event.stopPropagation();
					selectedLink.value = props.link;
					// TODO improve this to use addEventListener
					window.onkeydown = (e) => {
						if (e.key === 'Delete' || e.key === 'Backspace') {
							e.preventDefault();
							e.stopPropagation();
							const linkIndex = chart.value.links.findIndex((l) => l.uuid === selectedLink.value!.uuid);
							chart.value.links.splice(linkIndex, 1);
							selectedLink.value = null;
						}
					}
				}
			}

			onUnmounted(() => {
				// TODO improve this to use removeEventListener
				window.onkeydown = null;
			});

			return {
				selectedLink,
				curvature,
				pointerDown,
			}
		}
	});

</script>