import { Component, createEffect, createMemo, createSignal } from "solid-js";
import { AnimatableList } from "./AnimatableList";
import { Draggable } from "./Draggable";
import { DragOverSensor } from "./DragOverSensor";
import { DropTarget } from "./DropTarget";
import { useMultiDraggableListStore } from "./MultiDraggableListStoreProvider";
import { DropPosition, ListDirection } from "./types";
import { useDropAt } from "./use-drop-at";

type Props = {
    class?: string;
    index: number;
    direction: ListDirection;
    ItemComponent: Component<any>;
};

export const DraggableList: Component<Props> = (props: Props) => {
    const { store, setDragFromListIndex, stopDrag, setDragInProgress, setDraggableElementSizes, setDragFromItemIndex, setDragToListIndex, performDrag } = useMultiDraggableListStore();
    const [moveToIndex, setMoveToIndex] = createSignal(-1);
    const [moveToPosition, setMoveToPosition] = createSignal<DropPosition>('before');
    const { dropAt, setDropAt, lastDropAt } = useDropAt();
    const [isDragHandledByChildSensors, setDragHandledByChildSensors] = createSignal(false);
    const isDragInsideThisList = createMemo(() => store.dragToListIndex === props.index);
    const isDragBetweenElementsOfThisList = createMemo(() => isDragInsideThisList() && store.dragFromListIndex === props.index);

    createEffect(() => {
        if (!isDragInsideThisList()) {
            setDragHandledByChildSensors(false);
        }
    });

    const handleDragStart = (itemIndex: number, draggableItemWidth: number, draggableItemHeight: number) => {
        setDragFromItemIndex(itemIndex);
        setDragFromListIndex(props.index);
        setDropAt({
            index: itemIndex,
            position: 'before'
        });
        setDraggableElementSizes(draggableItemWidth, draggableItemHeight);
        setDragInProgress(true);
    }

    const updateDropAt = (itemIndex: number, position: DropPosition) => {
        const { index, position: lastTrackedPosition } = dropAt();

        if (index !== itemIndex || lastTrackedPosition !== position) {
            console.log(`Set index to ${itemIndex}:${position}`);
            setMoveToIndex(itemIndex);
            setMoveToPosition(position);

            setDropAt({ index: itemIndex, position });
        }
    }

    const handleDragOver = (itemIndex: number, position: DropPosition) => {
        if (isItemBeingDragged(itemIndex)) {
            return;
        }

        updateDropAt(itemIndex, position);

        setDragHandledByChildSensors(true);
        setDragToListIndex(props.index);
    };

    const handleDragEnd = () => {
        console.log('Drag ended');
        setMoveToIndex(-1);
        stopDrag();
    };

    const handleDrop = () => {
        console.log('Dropped');
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
        const { index: dropIndex } = dropAt();
        console.log(`Current dropIndex: ${dropIndex}`);

        if (isDragInsideThisList()) {
            const elementsCopy = elements.slice();
            
            const { index: lastDropAtIndex } = lastDropAt();
            console.log(`Last dropIndex: ${lastDropAtIndex}`);
            [elementsCopy[lastDropAtIndex], elementsCopy[dropIndex]] = [elementsCopy[dropIndex], elementsCopy[lastDropAtIndex]];

            return elementsCopy;
        }

        return elements;
    });

    return (
        <DropTarget component="ul" onDrop={handleDrop} class={props.class} onDragEnter={handleListDragEnter}>
            <AnimatableList shouldSkipRemovalAnimation={!store.isDragInProgress}>
                {renderedItemsElements}
            </AnimatableList>
        </DropTarget>
    );
};