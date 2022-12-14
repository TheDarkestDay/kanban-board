import { Component, JSXElement } from "solid-js";

type Props = {
    children: JSXElement;
    onDragStart: (width: number, height: number) => void;
    onDragEnd: () => void;
};

export const Draggable: Component<Props> = ({children, onDragStart, onDragEnd}) => {
    let rootElement: HTMLDivElement | undefined;

    const handleDragStart = (event: DragEvent) => {
        if (rootElement == null) {
            return;
        }

        event.dataTransfer?.setData('text/plain', '0');

        onDragStart(
            rootElement.offsetWidth,
            rootElement.offsetHeight
        );
    };

    const handleDragEnd = () => {
        onDragEnd();
    };

    return (
        <div ref={rootElement} draggable={true} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            {children}
        </div>
    );
};