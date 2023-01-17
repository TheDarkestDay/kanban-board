import { Component, createEffect, createMemo, createSignal, For, Show } from "solid-js";
import { Draggable } from "./Draggable";
import { DragOverSensor } from "./DragOverSensor";
import { DropTarget } from "./DropTarget";
import { useMultiDraggableListStore } from "./MultiDraggableListStoreProvider";
import { DropPosition, ListDirection } from "./types";
import { useDraggableListItemsStyles } from "./use-draggable-list-items-styles";

type Props = {
    class?: string;
    index: number;
    direction: ListDirection;
    ItemComponent: Component<any>;
};

type DropAt = {
    index: number;
    position: DropPosition;
};

export const DraggableList: Component<Props> = ({ class: className, ItemComponent, direction, index }) => {
    const { store, setDragFromListIndex, setDragInProgress, setDraggableElementSizes, setDragFromItemIndex, setDragToListIndex, performDrag } = useMultiDraggableListStore();
    const { styles: itemsStyles, reset } = useDraggableListItemsStyles(store.itemsLists[index].length);
    const [moveToIndex, setMoveToIndex] = createSignal(-1);
    const [hasFinishedAnimatingElements, setFinishedAnimatingElements] = createSignal(true);
    const [moveToPosition, setMoveToPosition] = createSignal<DropPosition>('before');
    const [lastDropAt, setLastDropAt] = createSignal<DropAt>({
        index: -1,
        position: 'before'
    });
    const [isDragHandledByChildSensors, setDragHandledByChildSensors] = createSignal(false);
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

    createEffect(() => {
        if (!isDragInsideThisList()) {
            setDragHandledByChildSensors(false);
        }
    });

    const handleDragStart = (itemIndex: number, draggableItemWidth: number, draggableItemHeight: number) => {
        setDragFromItemIndex(itemIndex);
        setDragFromListIndex(index);
        setDraggableElementSizes(draggableItemWidth, draggableItemHeight);
        setDragInProgress(true);
    }

    const updateDropAt = (itemIndex: number, position: DropPosition) => {
        const { index, position: lastTrackedPosition } = lastDropAt();

        if (index !== itemIndex || lastTrackedPosition !== position) {
            setMoveToIndex(itemIndex);
            setMoveToPosition(position);

            setLastDropAt({ index: itemIndex, position });
        }
    }

    const handleDragOver = (itemIndex: number, position: DropPosition) => {
        updateDropAt(itemIndex, position);

        setDragHandledByChildSensors(true);
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

    const handleListDragEnter = () => {
        if (isDragHandledByChildSensors()) {
            return;
        }

        setMoveToIndex(
            Math.max(0, store.itemsLists[index].length - 1),
        );
        setDragToListIndex(index);
        setMoveToPosition('after');
    };

    const handleElementsDoneAnimating = () => {
        if (hasFinishedAnimatingElements()) {
            return;
        }

        setFinishedAnimatingElements(true);
        reset();
    };

    return (
        <DropTarget component="ul" onDrop={handleDrop} class={className} onDragEnter={handleListDragEnter}>
            <For each={store.itemsLists[index]}>
                {(item, itemIndex) =>
                    <DragOverSensor component="li" onTransitionEnd={handleElementsDoneAnimating} style={itemsStyles()[itemIndex()]} direction={direction} onDragOver={(position) => handleDragOver(itemIndex(), position)}>
                        <Show when={itemIndex() === moveToIndex()}>
                            <div style={dropZoneStyle()}></div>
                        </Show>
                        <Draggable style={itemIndex() === moveToIndex() ? {position: 'absolute', left: '-9999px', top: '-9999px'} : undefined} onDragStart={(width, height) => handleDragStart(itemIndex(), width, height)} onDragEnd={handleDragEnd}>
                            <ItemComponent {...item} />
                        </Draggable>
                    </DragOverSensor>}
            </For>
        </DropTarget>
    );
};