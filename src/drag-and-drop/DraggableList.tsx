import { Component, createMemo, createSignal, For, Show } from "solid-js";
import { Draggable } from "./Draggable";
import { DropTarget } from "./DropTarget";
import { useMultiDraggableListStore } from "./MultiDraggableListStoreProvider";
import { DropPosition, ListDirection } from "./types";

type Props = {
    class?: string;
    index: number;
    direction: ListDirection;
    ItemComponent: Component<any>;
};

export const DraggableList: Component<Props> = ({ class: className, ItemComponent, direction, index }) => {
    const { store, setDragFromListIndex, setDragInProgress, setDraggableElementSizes, setDragFromItemIndex, setDragToListIndex, performDrag } = useMultiDraggableListStore();
    const [moveToIndex, setMoveToIndex] = createSignal(-1);
    const [moveToPosition, setMoveToPosition] = createSignal<DropPosition>('before');
    const [isOwnItemBeingDragged, setOwnItemBeingDragged] = createSignal(false);
    const dropZoneStyle = createMemo(() => {
        const isListEmpty = store.itemsLists[index].length === 0;

        if (isListEmpty && store.isDragInProgress) {
            return {
                width: `${store.draggableElementWidth}px`,
                height: `${store.draggableElementHeight}px`,
                'background-color': 'red'
            };
        }

        const isDragInsideThisList = store.isDragInProgress || isOwnItemBeingDragged();
        const hasDragLeft = store.dragToListIndex !== index;
        if (isDragInsideThisList && !hasDragLeft) {
            return {
                width: `${store.draggableElementWidth}px`,
                height: `${store.draggableElementHeight}px`,
                'background-color': 'red'
            };
        }
    });


    const handleDragStart = (itemIndex: number, draggableItemWidth: number, draggableItemHeight: number) => {
        setDragFromItemIndex(itemIndex);
        setDragFromListIndex(index);
        setDraggableElementSizes(draggableItemWidth, draggableItemHeight);
        setDragInProgress(true);

        setOwnItemBeingDragged(true);
    }

    const handleDragOver = (itemIndex: number, position: DropPosition) => {
        setMoveToIndex(itemIndex);
        setMoveToPosition(position);

        setDragToListIndex(index);
    };

    const handleDragEnd = () => {
        setMoveToIndex(-1);
    };

    const handleDrop = () => {
        const to = moveToIndex();
        const position = moveToPosition();

        performDrag(to, position);

        setMoveToIndex(-1);
        setOwnItemBeingDragged(false);
    };

    const isPointerBeforeItemAtIndex = (itemIndex: number) => {
        return moveToPosition() === 'before' && itemIndex === moveToIndex();
    };

    const isPointerAfterItemAtIndex = (itemIndex: number) => {
        return moveToPosition() === 'after' && itemIndex === moveToIndex();
    };

    return (
        <ul class={className}>
            <For each={store.itemsLists[index]}>
                {(item, itemIndex) =>
                    <DropTarget direction={direction} onDragOver={(position) => handleDragOver(itemIndex(), position)} onDrop={handleDrop}>
                        <Show when={isPointerBeforeItemAtIndex(itemIndex())}>
                            <div style={dropZoneStyle()}></div>
                        </Show>
                        <Draggable onDragStart={(width, height) => handleDragStart(itemIndex(), width, height)} onDragEnd={handleDragEnd}>
                            <ItemComponent {...item} />
                        </Draggable>
                        <Show when={isPointerAfterItemAtIndex(itemIndex())}>
                            <div style={dropZoneStyle()}></div>
                        </Show>
                    </DropTarget>}
            </For>
            <Show when={store.itemsLists[index].length === 0 && store.isDragInProgress}>
                <DropTarget direction={direction} onDrop={handleDrop} onDragOver={() => handleDragOver(0, 'before')}>
                    <div style={dropZoneStyle()}></div>
                </DropTarget>
            </Show>
        </ul>
    );
};