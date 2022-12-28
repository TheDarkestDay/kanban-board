import { Component, JSXElement, ValidComponent } from "solid-js";
import { Dynamic } from "solid-js/web"; 

type Props = {
    class?: string;
    onDrop: () => void;
    onDragEnter?: () => void;
    component?: ValidComponent;
    children?: JSXElement;
};

export const DropTarget: Component<Props> = (props) => {
    let ref: HTMLElement | undefined;

    const handleDragOver = (event: DragEvent) => {
        event.preventDefault();
    };

    const handleDrop = (event: DragEvent) => {
        event.preventDefault();
        props.onDrop();
    };

    const handleDragEnter = (event: DragEvent) => {
        if (event.target === ref && props.onDragEnter) {
            props.onDragEnter();
        }
    };

    return (
        <Dynamic ref={ref} component={props.component} class={props.class} onDragEnter={handleDragEnter} onDrop={handleDrop} onDragOver={handleDragOver}>
            {props.children}
        </Dynamic>
    );
};