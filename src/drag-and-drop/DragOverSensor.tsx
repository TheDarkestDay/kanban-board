import { Component, JSXElement, JSX, createSignal } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { useMultiDraggableListStore } from './MultiDraggableListStoreProvider';

import { DropPosition, ListDirection } from './types';

type Props = {
    children: JSXElement;
    id?: string;
    component?: string;
    style?: JSX.CSSProperties | string;
    onTransitionEnd?: () => void;
    onDragOver: (position: DropPosition) => void;
    direction: ListDirection;
};

export const DragOverSensor: Component<Props> = (props: Props) => {
    let rootElement: HTMLDivElement | undefined;

    const { pointerMovementDirection } = useMultiDraggableListStore();

    const [isDragOverHandled, setDragOverHandled] = createSignal(false);

    const { direction, onDragOver, component } = props;

    const handleDragOver = (event: DragEvent) => {
        event.preventDefault();

        if (rootElement == null) {
            return;
        }

        const { width, height, top, left } = rootElement.getBoundingClientRect();

        const medianX = left + width / 2;
        const medianY = top + height / 2;

        const pointerX = event.clientX;
        const pointerY = event.clientY;

        const [ currentPointerPosition, threshold ] = direction === 'inline' ? [pointerX, medianX] : [pointerY, medianY];

        const pointerDirection = pointerMovementDirection();
        console.log(`Got direction: ${pointerDirection}`);
        const isBeyondMedian = pointerDirection === 'forward' ? currentPointerPosition > threshold : currentPointerPosition < threshold;

        if (isBeyondMedian) {
            if (!isDragOverHandled()) {
                onDragOver('after');
                setDragOverHandled(true);
            }
        } else {
            setDragOverHandled(false);
        }
    };

    return (
        <Dynamic id={props.id} ref={rootElement} onTransitionEnd={props.onTransitionEnd} style={props.style} component={component} onDragOver={handleDragOver}>
            {props.children}
        </Dynamic>
    );
};