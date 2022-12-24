import { Component, JSXElement, onMount, onCleanup } from "solid-js";

type Props = {
    children: JSXElement;
    onDragStart: (width: number, height: number) => void;
    onDragEnd: () => void;
};

export const Draggable: Component<Props> = ({children, onDragStart, onDragEnd}) => {
    let rootElement: HTMLDivElement | undefined;

    const handleDragStart = () => {
        if (rootElement == null) {
            return;
        }

        onDragStart(
            rootElement.offsetWidth,
            rootElement.offsetHeight
        );
    };

    const handleDragEnd = () => {
        onDragEnd();
    };

    onMount(() => {
        if (rootElement == null) {
            return;
        }

        rootElement.addEventListener('dragstart', handleDragStart);
        rootElement.addEventListener('dragend', handleDragEnd);
    });

    onCleanup(() => {
        if (rootElement == null) {
            return;
        }

        rootElement.removeEventListener('dragstart', handleDragStart);
        rootElement.removeEventListener('dragend', handleDragEnd);
    });

    return (
        <div ref={rootElement} draggable={true}>
            {children}
        </div>
    );
};