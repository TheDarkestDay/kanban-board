import { Component, createSignal, Show } from "solid-js";
import { Draggable } from "./Draggable";
import { DropTarget } from "./DropTarget";
import { DropPosition } from "./types";

type Props = {
    class?: string;
    items: any[];
    ItemComponent: Component<any>;
};

export const dragItemTo = (items: any[], from: number, to: number, position: DropPosition) => {
    const indexDelta = to - from;
    const result = items.slice();

    const [elementToMove] = result.splice(from, 1);

    const insertionIndex = indexDelta > 0 ? to - 1 : to;
    const positionAwareIndex = position === 'before' ? insertionIndex : insertionIndex + 1;

    result.splice(positionAwareIndex, 0, elementToMove);

    return result;
};

type DropTo = {
    index: number;
    position: DropPosition;
};

export const DraggableList: Component<Props> = ({ class: className, items, ItemComponent }) => {
    let itemElement: HTMLDivElement | undefined;

    const [sorteditems, setSortedItems] = createSignal(items);
    const [moveToIndex, setMoveToIndex] = createSignal(-1);
    const [moveToPosition, setMoveToPosition] = createSignal<DropPosition>('before');
    const [draggedItemIndex, setDraggedItemIndex] = createSignal(-1);
    const [dropZoneStyle, setDropZoneStyle] = createSignal({
        width: 'auto',
        height: 'auto',
    });

    const handleDragStart = (index: number) => {
        setDraggedItemIndex(index);

        if (itemElement == null) {
            return;
        }

        setDropZoneStyle({
            width: `${itemElement.offsetWidth}px`,
            height: `${itemElement.offsetHeight}px`,
        });
    }

    const handleDragOver = (index: number, position: DropPosition) => {
        setMoveToIndex(index);
        setMoveToPosition(position);
    };

    const handleDragEnd = () => {
        setMoveToIndex(-1);
    };

    const handleDrop = () => {
        const currentItems = sorteditems();
        const fromIndex = draggedItemIndex();
        const toIndex = moveToIndex();
        const position = moveToPosition();
        console.log(`Dragging element ${fromIndex} to ${position} ${toIndex} `);
        const itemsAfterDrag = dragItemTo(currentItems, fromIndex, toIndex, position);

        setSortedItems(itemsAfterDrag);
        setMoveToIndex(-1);
    };

    return (
        <ul class={className}>{
            [
                <Show when={moveToPosition() === 'before' && moveToIndex() === 0}>
                    <div style={{ ...dropZoneStyle(), 'background-color': 'red' }}></div>
                </Show>,
                ...sorteditems().map((item, index) =>
                    <>
                        <DropTarget onDragOver={(position) => handleDragOver(index, position)} onDrop={handleDrop}>
                            <Draggable onDragStart={() => handleDragStart(index)} onDragEnd={handleDragEnd}>
                                <ItemComponent ref={itemElement} {...item} />
                            </Draggable>
                        </DropTarget>
                        <Show when={moveToPosition() === 'after' && moveToIndex() === index}>
                            <div style={{ ...dropZoneStyle(), 'background-color': 'red' }}></div>
                        </Show>
                    </>
                )
            ]
        }</ul>
    );
};