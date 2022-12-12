import { Component, createSignal } from "solid-js";
import { Draggable } from "./Draggable";
import { DropTarget } from "./DropTarget";

type Props = {
    class?: string;
    items: any[];
    ItemComponent: Component<any>;
};

export const dragItemTo = (items: any[], from: number, to: number, position: 'before' | 'after') => {
    const indexDelta = to - from;
    const result = items.slice();

    const [elementToMove] = result.splice(from, 1);

    const insertionIndex = indexDelta > 0 ? to - 1 : to;
    const positionAwareIndex = position === 'before' ? insertionIndex : insertionIndex + 1;

    result.splice(positionAwareIndex, 0, elementToMove);

    return result;
};

export const DraggableList: Component<Props> = ({ class: className, items, ItemComponent }) => {
    const [sorteditems, setSortedItems] = createSignal(items);
    const [moveTo, setMoveTo] = createSignal(0);
    const [draggedItemIndex, setDraggedItemIndex] = createSignal(0);

    const handleDrop = () => {
        const currentItems = sorteditems();
        const itemsAfterDrag = dragItemTo(currentItems, draggedItemIndex(), moveTo(), 'before');

        setSortedItems(itemsAfterDrag);
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