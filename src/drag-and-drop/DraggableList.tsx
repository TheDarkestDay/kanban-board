import { Component, createSignal, For, Show } from "solid-js";
import { Draggable } from "./Draggable";
import { DropTarget } from "./DropTarget";
import { useMultiDraggableListStore } from "./MultiDraggableListStoreProvider";
import { DropPosition, ListDirection } from "./types";

type Props = {
    class?: string;
    index?: number;
    direction: ListDirection;
    items: any[];
    ItemComponent: Component<any>;
};

export const DraggableList: Component<Props> = ({ class: className, items, ItemComponent, direction, index }) => {
    let itemElement: HTMLDivElement | undefined;

    const { setDragFromListIndex, setDragToListIndex, performDrag } = useMultiDraggableListStore();
    const [moveToIndex, setMoveToIndex] = createSignal(-1);
    const [moveToPosition, setMoveToPosition] = createSignal<DropPosition>('before');
    const [draggedItemIndex, setDraggedItemIndex] = createSignal(-1);
    const [dropZoneStyle, setDropZoneStyle] = createSignal({
        width: 'auto',
        height: 'auto',
    });

    const handleDragStart = (itemIndex: number) => {
        setDraggedItemIndex(itemIndex);

        if (index != null) {
            setDragFromListIndex(index);
        }

        if (itemElement == null) {
            return;
        }

        setDropZoneStyle({
            width: `${itemElement.offsetWidth}px`,
            height: `${itemElement.offsetHeight}px`,
        });
    }

    const handleDragOver = (itemIndex: number, position: DropPosition) => {
        setMoveToIndex(itemIndex);
        setMoveToPosition(position);

        if (index != null) {
            setDragToListIndex(index);
        }
    };

    const handleDragEnd = () => {
        setMoveToIndex(-1);
    };

    const handleDragLeave = () => {
        setMoveToIndex(-1);
    }

    const handleDrop = () => {
        const from = draggedItemIndex();
        const to = moveToIndex();
        const position = moveToPosition();

        performDrag(from, to, position);

        setMoveToIndex(-1);
    };

    return (
        <ul class={className}>
            <For each={items}>
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