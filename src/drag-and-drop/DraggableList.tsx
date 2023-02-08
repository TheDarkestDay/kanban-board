import { children, Component, createEffect, createMemo, createSignal, JSXElement } from "solid-js";
import { AnimatableList } from "./AnimatableList";
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

type DropAt = {
    index: number;
    position: DropPosition;
};

export const DraggableList: Component<Props> = (props: Props) => {
    const { store, setDragFromListIndex, stopDrag, setDragInProgress, setDraggableElement, setDragFromItemIndex, setDragToListIndex, performDrag } = useMultiDraggableListStore();
    const [moveToIndex, setMoveToIndex] = createSignal(-1);
    const [moveToPosition, setMoveToPosition] = createSignal<DropPosition>('before');
    const [lastDropAt, setLastDropAt] = createSignal<DropAt>({
        index: -1,
        position: 'before'
    });
    const [isDragHandledByChildSensors, setDragHandledByChildSensors] = createSignal(false);
    const isDragInsideThisList = createMemo(() => store.dragToListIndex === props.index);
    const [orderedElementIds, setOrderedElementIds] = createSignal<string[]>([]);
    const isDragBetweenElementsOfThisList = createMemo(() => isDragInsideThisList() && store.dragFromListIndex === props.index);

    createEffect(() => {
        if (!isDragInsideThisList()) {
            setDragHandledByChildSensors(false);
        }
    });

    createEffect(() => {
        const { index: dropIndex } = lastDropAt();

        setOrderedElementIds((currentOrder) => {
            const currentOrderCopy = currentOrder.slice();
            const currentDraggableElementIndex = currentOrderCopy.findIndex((id) => id === store.draggableElement!.id) ?? 0;

            [currentOrderCopy[currentDraggableElementIndex], currentOrderCopy[dropIndex]] = [currentOrderCopy[dropIndex], currentOrderCopy[currentDraggableElementIndex]];

            return currentOrderCopy;
        });
    });

    const handleDragStart = (itemIndex: number) => {
        const elements = listItemsDomElements() as HTMLElement[];

        setDragFromItemIndex(itemIndex);
        setDragFromListIndex(props.index);
        setLastDropAt({
            index: itemIndex,
            position: 'before'
        });
        setDraggableElement(elements[itemIndex]);
        setDragInProgress(true);
        setOrderedElementIds(store.itemsLists[props.index].map((item) => item.id));
    };

    const updateDropAt = (itemIndex: number, position: DropPosition) => {
        const { index, position: lastTrackedPosition } = lastDropAt();

        if (index !== itemIndex || lastTrackedPosition !== position) {
            console.log(`Set index to ${itemIndex}:${position} BLABLABLALBALBALBALB`);
            setMoveToIndex(itemIndex);
            setMoveToPosition(position);

            setLastDropAt({ index: itemIndex, position });
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
                <Draggable style={{opacity: isItemBeingDragged(itemIndex) ? 0.5 : 1}} onDragStart={() => handleDragStart(itemIndex)} onDragEnd={handleDragEnd}>
                    <props.ItemComponent {...item} />
                </Draggable>
            </DragOverSensor>;
        })
    });

    const listItemsDomElements = children(listItemsElements);

    const renderedItemsElements = createMemo(() => {
        const elements = listItemsDomElements() as HTMLElement[];

        if (isDragInsideThisList()) {
            const currentOrderOfIds = orderedElementIds();
            
            return currentOrderOfIds.map((elementId) => {
                const element = elements.find((itemElement) => itemElement.id === elementId);

                return element;
            });
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