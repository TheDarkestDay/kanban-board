import { Component, JSXElement, JSX, createSignal } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { ListDirection } from './types';

export type DragOverAnticipationPosition = 'before' | 'after';

type Props = {
    children: JSXElement;
    id?: string;
    component?: string;
    style?: JSX.CSSProperties | string;
    onTransitionEnd?: () => void;
    onDragOver: () => void;
    waitForDragOverFrom: 'after' | 'before';
    direction: ListDirection;
};

export const DragOverSensor: Component<Props> = (props: Props) => {
    let rootElement: HTMLDivElement | undefined;

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

        const isBeyondMedian = props.waitForDragOverFrom === 'before' ? currentPointerPosition >= threshold : currentPointerPosition < threshold;

        if (isBeyondMedian) {
            if (!isDragOverHandled()) {
                onDragOver();
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