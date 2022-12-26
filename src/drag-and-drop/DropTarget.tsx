import { Component, JSXElement, ValidComponent } from "solid-js";
import { Dynamic } from "solid-js/web"; 
import { DropPosition, ListDirection } from "./types";

type Props = {
    class?: string;
    direction: ListDirection;
    onDragOver: (position: DropPosition) => void;
    onDragEnter?: () => void;
    onDrop: () => void;
    onDragLeave?: () => void;
    component?: ValidComponent;
    children?: JSXElement;
};

export const DropTarget: Component<Props> = ({children, component = 'div', class: className, onDrop, onDragEnter, onDragOver, onDragLeave, direction}) => {
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

    const handleDragEnter = (event: DragEvent) => {
        event.preventDefault();
        if (onDragEnter) {
            onDragEnter();
        }
    };

    const handleDrop = () => {
        onDrop();
    };

    const handleDragLeave = () => {
        if (onDragLeave) {
            onDragLeave();
        }
    };

    return (
        <Dynamic component={component} class={className} ref={rootElement} onDragEnter={handleDragEnter} onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
            {children}
        </Dynamic>
    );
};