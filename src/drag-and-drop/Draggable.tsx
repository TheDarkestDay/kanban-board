import { Component, JSXElement, onMount, onCleanup } from "solid-js";

type Props = {
    children: JSXElement;
    onDragStart: () => void;
};

export const Draggable: Component<Props> = ({children, onDragStart}) => {
    let rootElement: HTMLDivElement | undefined;

    const handleDragStart = (event: DragEvent) => {
        onDragStart();
    };

    onMount(() => {
        if (rootElement == null) {
            return;
        }

        rootElement.addEventListener('dragstart', handleDragStart);
    });

    onCleanup(() => {
        if (rootElement == null) {
            return;
        }

        rootElement.removeEventListener('dragstart', handleDragStart);
    });

    return (
        <div ref={rootElement} draggable={true}>
            {children}
        </div>
    );
};