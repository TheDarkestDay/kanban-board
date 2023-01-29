import { Component, createEffect, createMemo, createSignal } from "solid-js";
import { AnimatableList, log } from "./AnimatableList";
import { Draggable } from "./Draggable";
import { DragOverSensor } from "./DragOverSensor";
import { DropTarget } from "./DropTarget";
import { insertItemAt, useMultiDraggableListStore } from "./MultiDraggableListStoreProvider";
import { DropPosition, ListDirection } from "./types";

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

export const DraggableList: Component<Props> = (props: Props) => {
    const { store, setDragFromListIndex, setDragInProgress, setDraggableElementSizes, setDragFromItemIndex, setDragToListIndex, performDrag } = useMultiDraggableListStore();
    const [moveToIndex, setMoveToIndex] = createSignal(-1);
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
    const isDragInsideThisList = createMemo(() => store.dragToListIndex === props.index);

    createEffect(() => {
        if (!isDragInsideThisList()) {
            setDragHandledByChildSensors(false);
        }
    });

    const handleDragStart = (itemIndex: number, draggableItemWidth: number, draggableItemHeight: number) => {
        setDragFromItemIndex(itemIndex);
        setDragFromListIndex(props.index);
        setDraggableElementSizes(draggableItemWidth, draggableItemHeight);
        setDragInProgress(true);
    }

    const updateDropAt = (itemIndex: number, position: DropPosition) => {
        const { index, position: lastTrackedPosition } = lastDropAt();

        if (index !== itemIndex || lastTrackedPosition !== position) {
            log(`Set index to ${itemIndex}:${position}`);
            setMoveToIndex(itemIndex);
            setMoveToPosition(position);

            setLastDropAt({ index: itemIndex, position });
        }
    }

    const handleDragOver = (itemIndex: number, position: DropPosition) => {
        updateDropAt(itemIndex, position);

        setDragHandledByChildSensors(true);
        setDragToListIndex(props.index);
    };

    const handleDragEnd = () => {
        setMoveToIndex(-1);
    };

    const handleDrop = () => {
        const lastRecordedMoveToList = store.dragToListIndex;

        if (lastRecordedMoveToList !== props.index) {
            setDragToListIndex(props.index);

            performDrag(store.itemsLists[props.index].length - 1, 'after');
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
            Math.max(0, store.itemsLists[props.index].length - 1),
        );
        setDragToListIndex(props.index);
        setMoveToPosition('after');
    };

    const isItemBeingDragged = (itemIndex: number) => {
        return store.dragFromListIndex === props.index && itemIndex === store.dragFromItemIndex;
    };

    const listItemsElements = createMemo(() => {
        return store.itemsLists[props.index].map((item, itemIndex) => {
            return <DragOverSensor style={{transition: 'transform .25s'}} id={item.id} component="li" direction={props.direction} onDragOver={(position) => handleDragOver(itemIndex, position)}>
                <Draggable style={{opacity: isItemBeingDragged(itemIndex) ? 0.5 : 1}} onDragStart={(width, height) => handleDragStart(itemIndex, width, height)} onDragEnd={handleDragEnd}>
                    <props.ItemComponent {...item} />
                </Draggable>
            </DragOverSensor>;
        })
    });

    const renderedItemsElements = createMemo(() => {
        const elements = listItemsElements();
        const { index: dropIndex, position } = lastDropAt();
        const adjustedIndex = position === 'after' ? dropIndex + 1 : dropIndex;

        if (!isDragInsideThisList() || adjustedIndex === store.dragFromItemIndex) {
            return elements;
        }
        log(`Inserting item at ${adjustedIndex}`);
        return insertItemAt(elements.slice(), <div id="dropZone" style={dropZoneStyle()}></div>, adjustedIndex, 'before');
    });

    return (
        <DropTarget component="ul" onDrop={handleDrop} class={props.class} onDragEnter={handleListDragEnter}>
            <AnimatableList>
                {renderedItemsElements}
            </AnimatableList>
        </DropTarget>
    );
};