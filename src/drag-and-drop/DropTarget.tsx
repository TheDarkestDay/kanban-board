import { Component, JSXElement, ValidComponent } from "solid-js";
import { Dynamic } from "solid-js/web"; 

type Props = {
    class?: string;
    onDrop: () => void;
    component?: ValidComponent;
    children?: JSXElement;
};

export const DropTarget: Component<Props> = (props) => {
    const handleDragOver = (event: DragEvent) => {
        event.preventDefault();
    };

    const handleDrop = (event: DragEvent) => {
        event.preventDefault();
        props.onDrop();
    };

    return (
        <Dynamic component={props.component} class={props.class} onDrop={handleDrop} onDragOver={handleDragOver}>
            {props.children}
        </Dynamic>
    );
};