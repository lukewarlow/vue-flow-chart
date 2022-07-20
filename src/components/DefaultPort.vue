<template>
	<div
		:id="`port-${port.uuid}`"
		ref="portRef"
		@pointerdown="pointerDown"
		@pointerup="pointerUp"
		@pointermove="pointerMove"
		@pointerover="pointerOver"
		class="cursor-pointer -m-3 border-4 border-gray-300 ${colourClasses.value} w-6 h-6 rounded-2xl touch-none"
		:class="colourClasses"
	>
		<slot></slot>
	</div>
</template>

<script lang="ts">
	import {computed, defineComponent, PropType, reactive, ref} from 'vue';
	import useGlobalState from '../state/global-state';
	import {getPointerCoords, getPortCoords} from '../utils/coordinates';
	import {Port} from '../types';

	export default defineComponent({
		name: 'DefaultPort',
		props: {
			port: {
				type: Object as PropType<Port>,
				required: true,
			},
			nodeUuid: {
				type: String,
				required: true,
			},
			nodeX: {
				type: Number,
				default: 0,
			},
			nodeY: {
				type: Number,
				default: 0,
			},
		},
		setup(props, ctx) {
			const { chart, canvas, inProgressLink } = useGlobalState();

			const portRef = ref<HTMLDivElement>();

			const pointer = reactive({
				x: 0,
				y: 0
			});

			const trackPointer = ref(false);
			let timeoutId: number | null = null;

			function pointerOver(event: PointerEvent) {
				event.stopPropagation();
				if (!trackPointer.value) {
					if (inProgressLink.value && inProgressLink.value.startNodeUuid !== props.nodeUuid && ['output', 'both'].includes(props.port.type)) {
						chart.value.links.push({
							uuid: inProgressLink.value.uuid,
							startPortUuid: inProgressLink.value.startPortUuid,
							startNodeUuid: inProgressLink.value.startNodeUuid,
							endPortUuid: props.port.uuid,
							endNodeUuid: props.nodeUuid,
						});

						inProgressLink.value = null;

						if (timeoutId) {
							clearTimeout(timeoutId);
						}
					}
				}
			}

			function pointerDown(event: PointerEvent) {
				if (event.pointerType === 'mouse' && event.button !== 0) {
					return;
				}

				event.stopPropagation();
				event.preventDefault();

				if (inProgressLink.value) {
					return;
				}

				if (timeoutId) {
					clearTimeout(timeoutId);
				}

				if (portRef.value && ['input', 'both'].includes(props.port.type)) {
					trackPointer.value = true;
					portRef.value.setPointerCapture(event.pointerId);
					pointer.x = event.clientX;
					pointer.y = event.clientY;

					const { portX, portY } = getPortCoords(canvas.value!, portRef.value, chart.value.scale);

					inProgressLink.value = {
						uuid: crypto.randomUUID(),
						startX: portX,
						startY: portY,
						endX: portX,
						endY: portY,
						startPortUuid: props.port.uuid,
						startNodeUuid: props.nodeUuid,
					};
				}
			}

			function pointerUp(event: PointerEvent) {
				event.stopPropagation();

				if (trackPointer.value) {
					trackPointer.value = false;

					if (portRef.value) {
						portRef.value.releasePointerCapture(event.pointerId);
					}
					// @ts-ignore
					timeoutId = setTimeout(() => {
						if (inProgressLink.value) {
							inProgressLink.value = null;
						}
					}, 200);
				}
			}

			function pointerMove(event: PointerEvent) {
				if (inProgressLink.value && portRef.value && trackPointer.value) {
					event.stopPropagation();
					event.preventDefault();
					pointer.x = event.clientX;
					pointer.y = event.clientY;
					const { portX, portY } = getPortCoords(canvas.value!, portRef.value, chart.value.scale);
					const { pointerX, pointerY } = getPointerCoords(canvas.value!, event, chart.value.scale);

					inProgressLink.value.startX = portX;
					inProgressLink.value.startY = portY;
					inProgressLink.value.endX = pointerX;
					inProgressLink.value.endY = pointerY;
				}
			}

			const colourClasses = computed<string>(() => {
				if (props.port.type === 'both') {
					return 'bg-blue-700 hover:bg-blue-900';
				} else if (props.port.type === 'input') {
					return 'bg-green-700 hover:bg-green-900';
				} else if (props.port.type === 'output') {
					return 'bg-red-700 hover:bg-red-900';
				} else {
					return 'bg-grey-700 hover:bg-grey-900';
				}
			});

			return {
				portRef,
				colourClasses,
				pointerMove,
				pointerDown,
				pointerUp,
				pointerOver,
			}
		}
	});

</script>
