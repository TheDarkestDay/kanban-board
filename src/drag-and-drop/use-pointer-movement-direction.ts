import { createEffect, createMemo, createSignal, onCleanup } from "solid-js";
import { ListDirection } from "./types";

const POINTER_POSITIONS_BUFFER_LENGTH = 3;

export const usePointerMovementDirection = (listDirection: ListDirection, enabled: boolean) => {
    const [lastPointerPositions, setLastPointerPositions] = createSignal<number[]>([]);

    const handlePointerMove = (event: MouseEvent) => {
        const pointerPosition = listDirection === 'inline' ? event.screenX : event.screenY;
        setLastPointerPositions((pointerPositions) => pointerPositions.slice(-(POINTER_POSITIONS_BUFFER_LENGTH - 1)).concat(pointerPosition));
    };

    createEffect(() => {
        document.body.addEventListener('pointermove', handlePointerMove);
    });

    onCleanup(() => {
        document.body.removeEventListener('pointermove', handlePointerMove);
    });

    const direction = createMemo(() => {
        const positions = lastPointerPositions();

        for (let i = 0; i < positions.length - 1; i++) {
            const currentPosition = positions[i];
            const nextPosition = positions[i + 1];

            if (currentPosition > nextPosition) {
                console.log('Setting to backward');
                return 'backward';
            }
        }

        console.log('Setting to forward');
        return 'forward';
    });

    return direction;
};