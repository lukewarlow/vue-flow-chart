<template>
	<div
		id="draggable"
		ref="draggable"
		@pointerdown="pointerDown"
		@pointerup="pointerUp"
		@pointermove="pointerMove"
		class="top-0 left-0 touch-none cursor-move transform"
	>
		<slot></slot>
	</div>
</template>

<script lang="ts">
	import {defineComponent, nextTick, onMounted, onUnmounted, reactive, ref} from 'vue';
	import useGlobalState from '../state/global-state';

	export default defineComponent({
		name: 'BaseDraggable',
		props: {
			x: {
				type: Number,
				default: 0,
			},
			y: {
				type: Number,
				default: 0,
			},
			boundToCanvas: {
				type: Boolean,
				default: true,
			},
		},
		setup(props, ctx) {
			const id = crypto.randomUUID();
			const { selectedNode, canvas, selectedLink, scrollHandlers} = useGlobalState();

			const draggable = ref<HTMLDivElement>();

			const pointer = reactive({
				x: 0,
				y: 0
			});

			const scrollTop = ref(0);
			const scrollLeft = ref(0);

			const position = reactive({
				x: props.x,
				y: props.y,
			});

			const trackPointer = ref(false);

			function pointerDown(event: PointerEvent) {
				if (event.pointerType === 'mouse' && event.button !== 0) {
					return;
				}
				event.stopPropagation();
				event.preventDefault();

				selectedLink.value = null;
				selectedNode.value = null;
				// TODO improve this to use addEventListener
				window.onkeydown = null;

				if (draggable.value) {
					draggable.value.setPointerCapture(event.pointerId);
					pointer.x = event.clientX;
					pointer.y = event.clientY;

					trackPointer.value = true;
				}
			}

			function pointerUp(event: PointerEvent) {
				event.stopPropagation();
				if (draggable.value) {
					draggable.value.releasePointerCapture(event.pointerId);

					trackPointer.value = false;
				}
			}

			function pointerMove(event: PointerEvent) {
				event.stopPropagation();
				event.preventDefault();
				if (trackPointer.value) {
					if (draggable.value) {
						const rect = draggable.value.getBoundingClientRect();

						let startX = rect.left;
						let startY = rect.top;

						let pointerX = event.clientX;
						let pointerY = event.clientY;

						// if (props.boundToCanvas.value) {
						// 	let { left, top } = getBoundingRect(canvas.value, rect, chart.value.zoom);
						// 	startX = left;
						// 	startY = top;
						// 	let { pointerX: pX, pointerY: pY } = getPointerCoordsTwo(canvas.value, event, chart.value.zoom);
						// 	pointerX = pX;
						// 	pointerY = pY;
						// }

						const pointerElXDif = pointer.x - startX;
						const pointerElYDif = pointer.y - startY;

						// TODO Account for canvas zoom somehow
						const xChange = pointerX - pointerElXDif - startX;
						const yChange = pointerY - pointerElYDif - startY;

						setPos(draggable.value, xChange, yChange);

						pointer.x = pointerX;
						pointer.y = pointerY;
					}
				}
			}

			function emitMove(xPos: number, yPos: number) {
				ctx.emit('move', {x: xPos, y: yPos});
			}

			function setPos(el: HTMLElement, xChange: number, yChange: number) {
				const translateX = el.style.getPropertyValue('--tw-translate-x').replace('px', '') || 0;
				let xPos = +translateX + xChange;
				const translateY = el.style.getPropertyValue('--tw-translate-y').replace('px', '') || 0;
				let yPos = +translateY + yChange;

				if (props.boundToCanvas) {
					// TODO account for zoom
					const canvasRect = canvas.value!.getBoundingClientRect();
					const rect = el.getBoundingClientRect();
					// 12 is half the size of a port this probably needs accounting for better
					if ((xPos + rect.width + 12) > canvasRect.width) {
						xPos = canvasRect.width - (rect.width + 12);
					}
					if ((yPos + rect.height + 12) > canvasRect.height) {
						yPos = canvasRect.height - (rect.height + 12);
					}

					if (xPos < 12) {
						xPos = 12;
					}

					if (yPos < 12) {
						yPos = 12;
					}
				}

				position.x = xPos;
				position.y = yPos;

				el.style.setProperty('--tw-translate-x', `${xPos}px`, 'important');
				el.style.setProperty('--tw-translate-y', `${yPos}px`, 'important');
				emitMove(position.x, position.y);
			}

			onMounted(() => {
				nextTick(() => {
					setPos(draggable.value!, props.x, props.y);

					scrollHandlers.set(id, (event) => {
						// TODO throttle this with requestAnimationFrame
						if (trackPointer.value && draggable.value) {
							const yChange = event.target.scrollTop - scrollTop.value;
							scrollTop.value = event.target.scrollTop;
							const xChange = event.target.scrollLeft - scrollLeft.value;
							scrollTop.value = event.target.scrollTop;
							scrollLeft.value = event.target.scrollLeft;
							setPos(draggable.value, xChange, yChange);
						}
					})
				})
			});

			onUnmounted(() => {
				scrollHandlers.delete(id);
			});

			return {
				draggable,
				pointerMove,
				pointerUp,
				pointerDown
			}
		}
	});


</script>