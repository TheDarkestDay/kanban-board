import { Component, JSXElement, onMount, onCleanup } from "solid-js";

type Props = {
    class?: string;
    onDragOver: () => void;
    onDrop: () => void;
    children: JSXElement;
};

export const DropTarget: Component<Props> = ({children, class: className, onDrop, onDragOver}) => {
    let rootElement: HTMLDivElement | undefined;

    const handleDragOver = (event: DragEvent) => {
        event.preventDefault();
        onDragOver();
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