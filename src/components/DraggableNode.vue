<template>
	<draggable
		@move="move"
		@moveend="moveEnd"
		@click="click"
		ref="nodeRef"
		class="node"
		:class="{'selected': node.uuid === chart.selected?.data?.uuid}"
		:x="node.position.x"
		:y="node.position.y"
		:readonly="node.readonly"
	>
		<div class="flex justify-around">
			<template v-for="port in node.ports" :key="port.uuid">
				<default-port
					:node-uuid="node.uuid"
					:port="port"
					:node-x="node.position.x"
					:node-y="node.position.x"
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
		setup(props) {
			const { chart, canvas } = useGlobalState();
			const { addToHistory } = useChartHistory();

			const nodeRef = ref<HTMLElement>();

			function move(data: any) {
				const node = chart.value.nodes.find((n) => n.uuid === props.node.uuid)!;
				node.position.x = data.x;
				node.position.y = data.y;

				const outgoingLinks = chart.value.links.filter((link) => link.start.nodeUuid === props.node.uuid);
				outgoingLinks.forEach((link) => {
					const portRef = document.querySelector<HTMLElement>(`#port-${link.start.portUuid}`)!;
					const { portX, portY } = getPortCoords(canvas.value!, portRef, chart.value.scale);

					link.start.position ??= {
						x: 0,
						y: 0,
					}
					link.start.position.x = portX;
					link.start.position.y = portY;
				});

				const incomingLinks = chart.value.links.filter((link) => link.end.nodeUuid === props.node.uuid);
				incomingLinks.forEach((link) => {
					const portRef = document.querySelector<HTMLElement>(`#port-${link.end.portUuid}`)!;
					const { portX, portY } = getPortCoords(canvas.value!, portRef, chart.value.scale);

					link.end.position ??= {
						x: 0,
						y: 0,
					};
					link.end.position.x = portX;
					link.end.position.y = portY;
				});
			}

			function moveEnd() {
				addToHistory();
			}

			function click(event: PointerEvent) {
				if (!chart.value.selected) {
					event.stopPropagation();
					chart.value.selected = {
						type: "node",
						data: {
							uuid: props.node.uuid,
							readonly: props.node.readonly,
						},
					};
				}
			}

			return {
				nodeRef,
				chart,
				move,
				moveEnd,
				click,
			}
		}
	});
</script>
