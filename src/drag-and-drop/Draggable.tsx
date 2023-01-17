import { Component, JSX, JSXElement } from "solid-js";

type Props = {
    children: JSXElement;
    style?: JSX.CSSProperties;
    onDragStart: (width: number, height: number) => void;
    onDragEnd: () => void;
};

export const Draggable: Component<Props> = (props: Props) => {
    let rootElement: HTMLDivElement | undefined;

    const handleDragStart = (event: DragEvent) => {
        if (rootElement == null) {
            return;
        }

        event.dataTransfer?.setData('text/plain', '0');

        props.onDragStart(
            rootElement.offsetWidth,
            rootElement.offsetHeight
        );
    };

    const handleDragEnd = () => {
        props.onDragEnd();
    };

    return (
        <div ref={rootElement} style={props.style} draggable={true} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            {props.children}
        </div>
    );
};