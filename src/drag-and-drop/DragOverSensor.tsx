import type { Component, JSXElement, JSX } from 'solid-js';
import { Dynamic } from 'solid-js/web';

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

        const isBeyondMedian = direction === 'inline' ? pointerX > medianX : pointerY > medianY;

        if (isBeyondMedian) {
            onDragOver('after');
        } else {
            onDragOver('before');
        }
    };

    return (
        <Dynamic id={props.id} ref={rootElement} onTransitionEnd={props.onTransitionEnd} style={props.style} component={component} onDragOver={handleDragOver}>
            {props.children}
        </Dynamic>
    );
};