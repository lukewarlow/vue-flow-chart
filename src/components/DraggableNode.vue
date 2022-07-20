<template>
	<draggable
		@move="move"
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
	import {defineComponent, onUnmounted, PropType, ref} from 'vue';
	import useGlobalState from '../state/global-state';
	import {getPortCoords} from '../utils/coordinates';
	import Draggable from './Draggable.vue';
	import {ChartNode, Port} from '../types';
	import DefaultPort from './DefaultPort.vue';

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
			const { chart, canvas, selectedNode } = useGlobalState();

			const nodeRef = ref<HTMLElement>();

			function move(data: any) {
				// TODO this wont be e.detail soon
				// const x = data.x;
				// const y = data.y;

				// ctx.emit('move', {x, y});

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

			function click(event: PointerEvent) {
				if (!selectedNode.value) {
					event.stopPropagation();
					selectedNode.value = props.node;
					// props.node.x += 10;
					// TODO improve this to use addEventListener
					window.onkeydown = (e) => {
						if (e.key === 'Delete' || e.key === 'Backspace') {
							e.preventDefault();
							e.stopPropagation();
							const index = chart.value.nodes.findIndex((l) => l.uuid === selectedNode.value!.uuid);
							chart.value.nodes.splice(index, 1);
							selectedNode.value = null;
						}
					}
				}
			}

			onUnmounted(() => {
				// TODO improve this to use removeEventListener
				window.onkeydown = null;
			});

			return {
				nodeRef,
				selectedNode,
				move,
				click,
			}
		}
	});
</script>
