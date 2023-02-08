import { Component, JSX, JSXElement } from "solid-js";

type Props = {
    children: JSXElement;
    style?: JSX.CSSProperties;
    onDragStart: () => void;
    onDragEnd: () => void;
};

export const Draggable: Component<Props> = (props: Props) => {
    const handleDragStart = (event: DragEvent) => {
        event.dataTransfer?.setData('text/plain', '0');

        props.onDragStart();
    };

    const handleDragEnd = () => {
        props.onDragEnd();
    };

    return (
        <div style={props.style} draggable={true} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            {props.children}
        </div>
    );
};