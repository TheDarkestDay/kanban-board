import { Component, createSignal, For, Show } from "solid-js";
import { Draggable } from "./Draggable";
import { DropTarget } from "./DropTarget";
import { DropPosition, ListDirection } from "./types";

type Props = {
    class?: string;
    direction: ListDirection;
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

export const DraggableList: Component<Props> = ({ class: className, items, ItemComponent, direction }) => {
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

    const handleDragLeave = () => {
        setMoveToIndex(-1);
    }

    const handleDrop = () => {
        const currentItems = sorteditems();
        const fromIndex = draggedItemIndex();
        const toIndex = moveToIndex();
        const position = moveToPosition();
        const itemsAfterDrag = dragItemTo(currentItems, fromIndex, toIndex, position);

        setSortedItems(itemsAfterDrag);
        setMoveToIndex(-1);
    };

    return (
        <ul class={className}>
            <For each={sorteditems()}>
                {(item, index) =>
                    <DropTarget direction={direction} onDragOver={(position) => handleDragOver(index(), position)} onDrop={handleDrop}>
                        <Show when={moveToPosition() === 'before' && moveToIndex() === index()}>
                            <div style={{ ...dropZoneStyle(), 'background-color': 'red' }}></div>
                        </Show>
                        <Draggable onDragStart={() => handleDragStart(index())} onDragEnd={handleDragEnd}>
                            <ItemComponent ref={itemElement} {...item} />
                        </Draggable>
                        <Show when={moveToPosition() === 'after' && moveToIndex() === index()}>
                            <div style={{ ...dropZoneStyle(), 'background-color': 'red' }}></div>
                        </Show>
                    </DropTarget>}
            </For>
        </ul>
    );
};