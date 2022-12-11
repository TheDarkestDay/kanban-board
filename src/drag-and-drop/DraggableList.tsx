import { Component, createSignal } from "solid-js";
import { Draggable } from "./Draggable";
import { DropTarget } from "./DropTarget";

type Props = {
    class?: string;
    items: any[];
    ItemComponent: Component<any>;
};

export const DraggableList: Component<Props> = ({ class: className, items, ItemComponent }) => {
    const [sorteditems, setSortedItems] = createSignal(items);
    const [moveTo, setMoveTo] = createSignal(0);
    const [draggedItemIndex, setDraggedItemIndex] = createSignal(0);

    const handleDrop = () => {
        const currentItems = sorteditems();
        let newItems: any[] = [];

        const indexFrom = draggedItemIndex();
        const indexTo = moveTo();

        const indexDelta = indexTo - indexFrom;

        if (indexDelta < 0) {
            const head = currentItems.slice(0, indexTo);
            const tail = currentItems.slice(indexTo + 1, indexFrom);
            const intactTail = currentItems.slice(indexFrom + 1);

            newItems = [...head, currentItems[indexFrom], ...tail, ...intactTail];
        } else {
            const head = currentItems.slice(0, indexFrom);
            const middle = currentItems.slice(indexFrom + 1, indexTo);
            const tail = currentItems.slice(indexTo + 1);

            newItems = [...head, ...middle, currentItems[indexFrom], ...tail];
        }
        
        setSortedItems(newItems);
    };

    return (
        <ul class={className}>{
            sorteditems().map((item, index) =>
                <DropTarget onDragOver={() => setMoveTo(index)} onDrop={handleDrop}>
                    <Draggable onDragStart={() => setDraggedItemIndex(index)}>
                        <ItemComponent {...item} />
                    </Draggable>
                </DropTarget>
            )
        }</ul>
    );
};