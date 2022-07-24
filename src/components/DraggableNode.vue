<template>
	<draggable
		@move="move"
		@moveend="moveEnd"
		@click="click"
		ref="nodeRef"
		class="node"
		:class="{'selected': node.uuid === selectedNode?.uuid}"
		:x="node.x"
		:y="node.y"
	>
		<div class="flex justify-around">
			<template v-for="port in node.ports" :key="port.uuid">
				<default-port
					:node-uuid="node.uuid"
					:port="port"
					:node-x="node.x"
					:node-y="node.y"
				/>
			</template>
		</div>
		<div style="padding: 1.5rem; white-space: pre-line">{{node.rendering.text ?? node.rendering.dynamicText(node)}}</div>
	</draggable>
</template>

<script lang="ts">
	import {defineComponent, onMounted, onUnmounted, PropType, ref, toRaw, watch} from 'vue';
	import useGlobalState from '../state/global-state';
	import {getPortCoords} from '../utils/coordinates';
	import Draggable from './Draggable.vue';
	import {ChartNode, Port} from '../types';
	import DefaultPort from './DefaultPort.vue';
	import {data} from 'autoprefixer';
	import {useChartHistory} from '../composables/use-chart-history';

	export default defineComponent({
		name: 'DraggableNode',
		components: {
			Draggable,
			DefaultPort,
		},
		props: {
			node: {
				type: Object as PropType<ChartNode>,
				required: true
			},
		},
		setup(props, ctx) {
			const { chart, canvas, selectedNode, selectedLink } = useGlobalState();
			const { addToHistory } = useChartHistory();

			const nodeRef = ref<HTMLElement>();

			function move(data: any) {
				const node = chart.value.nodes.find((n) => n.uuid === props.node.uuid)!;
				node.x = data.x;
				node.y = data.y;

				const outgoingLinks = chart.value.links.filter((link) => link.startNodeUuid === props.node.uuid);
				outgoingLinks.forEach((link) => {
					const portRef = document.querySelector<HTMLElement>(`#port-${link.startPortUuid}`)!;
					const { portX, portY } = getPortCoords(canvas.value!, portRef, chart.value.scale);

					link.startX = portX;
					link.startY = portY;
				});

				const incomingLinks = chart.value.links.filter((link) => link.endNodeUuid === props.node.uuid);
				incomingLinks.forEach((link) => {
					const portRef = document.querySelector<HTMLElement>(`#port-${link.endPortUuid}`)!;
					const { portX, portY } = getPortCoords(canvas.value!, portRef, chart.value.scale);

					link.endX = portX;
					link.endY = portY;
				});
			}

			function moveEnd() {
				addToHistory();
			}

			function click(event: PointerEvent) {
				if (!selectedNode.value) {
					event.stopPropagation();
					selectedNode.value = props.node;
					selectedLink.value = null;
					window.addEventListener('keydown', keyDownHandler);
					window.dispatchEvent(new CustomEvent('node:selected', {
						cancelable: false,
						detail: {
							node: structuredClone(toRaw(props.node))
						}
					}));
				}
			}

			watch(selectedNode, (newValue) => {
				if (newValue === null) {
					window.removeEventListener('keydown', keyDownHandler);
				}
			});

			function keyDownHandler(event: KeyboardEvent) {
				if (event.key === 'Delete' || event.key === 'Backspace') {
					event.preventDefault();
					event.stopPropagation();
					const index = chart.value.nodes.findIndex((n) => n.uuid === selectedNode.value!.uuid);
					chart.value.nodes.splice(index, 1);
					selectedNode.value = null;

					const outgoingLinks = chart.value.links.filter((link) => link.startNodeUuid === props.node.uuid);
					outgoingLinks.forEach((link) => {
						const index = chart.value.links.findIndex((l) => l.uuid === link.uuid);
						chart.value.links.splice(index, 1);
					});

					const incomingLinks = chart.value.links.filter((link) => link.endNodeUuid === props.node.uuid);
					incomingLinks.forEach((link) => {
						const index = chart.value.links.findIndex((l) => l.uuid === link.uuid);
						chart.value.links.splice(index, 1);
					});
					addToHistory();
				}
			}

			onUnmounted(() => {
				window.removeEventListener('keydown', keyDownHandler);
			});

			return {
				nodeRef,
				selectedNode,
				move,
				moveEnd,
				click,
			}
		}
	});
</script>
