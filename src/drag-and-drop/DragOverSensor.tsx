import type { Component, JSXElement } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { DropPosition, ListDirection } from './types';

type Props = {
    children: JSXElement;
    component?: string;
    onDragOver: (position: DropPosition) => void;
    direction: ListDirection;
};

export const DragOverSensor: Component<Props> = ({children, component = 'div', onDragOver, direction}: Props) => {
    let rootElement: HTMLDivElement | undefined;

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
        <Dynamic ref={rootElement} component={component} onDragOver={handleDragOver}>
            {children}
        </Dynamic>
    );
};