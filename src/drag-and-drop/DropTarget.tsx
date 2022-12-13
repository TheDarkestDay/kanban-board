import { Component, JSXElement, onMount, onCleanup } from "solid-js";
import { DropPosition } from "./types";

type Props = {
    class?: string;
    onDragOver: (position: DropPosition) => void;
    onDrop: () => void;
    children: JSXElement;
};

export const DropTarget: Component<Props> = ({children, class: className, onDrop, onDragOver}) => {
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

        if (pointerX > medianX || pointerY > medianY) {
            onDragOver('after');
        } else {
            onDragOver('before');
        }
    };

    const handleDragEnter = (event: DragEvent) => {
        event.preventDefault();
    };

    const handleDrop = () => {
        onDrop();
    };

    onMount(() => {
        if (rootElement == null) {
            return;
        }

        rootElement.addEventListener('dragenter', handleDragEnter);
        rootElement.addEventListener('dragover', handleDragOver);
        rootElement.addEventListener('drop', handleDrop);
    });

    onCleanup(() => {
        if (rootElement == null) {
            return;
        }

        rootElement.removeEventListener('dragenter', handleDragEnter);
        rootElement.removeEventListener('dragover', handleDragOver);
        rootElement.removeEventListener('drop', handleDrop);
    });

    return (
        <div class={className} ref={rootElement}>
            {children}
        </div>
    );
};