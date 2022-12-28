import { Component, createMemo, createSignal, For, Show } from "solid-js";
import { Draggable } from "./Draggable";
import { DragOverSensor } from "./DragOverSensor";
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
    const dropZoneStyle = createMemo(() => {
        if (store.isDragInProgress) {
            return {
                width: `${store.draggableElementWidth}px`,
                height: `${store.draggableElementHeight}px`,
                'background-color': 'red'
            };
        }
    });
    const isDragInsideThisList = createMemo(() => store.dragToListIndex === index);


    const handleDragStart = (itemIndex: number, draggableItemWidth: number, draggableItemHeight: number) => {
        setDragFromItemIndex(itemIndex);
        setDragFromListIndex(index);
        setDraggableElementSizes(draggableItemWidth, draggableItemHeight);
        setDragInProgress(true);
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
        const lastRecordedMoveToList = store.dragToListIndex;

        if (lastRecordedMoveToList !== index) {
            setDragToListIndex(index);

            performDrag(store.itemsLists[index].length - 1, 'after');
        } else {
            const to = moveToIndex();
            const position = moveToPosition();

            performDrag(to, position);
        }

        setMoveToIndex(-1);
    };

    const isPointerBeforeItemAtIndex = (itemIndex: number) => {
        return isDragInsideThisList() && moveToPosition() === 'before' && itemIndex === moveToIndex();
    };

    const isPointerAfterItemAtIndex = (itemIndex: number) => {
        return isDragInsideThisList() && moveToPosition() === 'after' && itemIndex === moveToIndex();
    };

    return (
        <DropTarget component="ul" onDrop={handleDrop} class={className}>
            <For each={store.itemsLists[index]}>
                {(item, itemIndex) =>
                    <DragOverSensor component="li" direction={direction} onDragOver={(position) => handleDragOver(itemIndex(), position)}>
                        <Show when={isPointerBeforeItemAtIndex(itemIndex())}>
                            <div style={dropZoneStyle()}></div>
                        </Show>
                        <Draggable onDragStart={(width, height) => handleDragStart(itemIndex(), width, height)} onDragEnd={handleDragEnd}>
                            <ItemComponent {...item} />
                        </Draggable>
                        <Show when={isPointerAfterItemAtIndex(itemIndex())}>
                            <div style={dropZoneStyle()}></div>
                        </Show>
                    </DragOverSensor>}
            </For>
            <Show when={store.itemsLists[index].length === 0 && store.isDragInProgress}>
                <DragOverSensor direction={direction} onDragOver={() => handleDragOver(0, 'before')}>
                    <div style={dropZoneStyle()}></div>
                </DragOverSensor>
            </Show>
        </DropTarget>
    );
};