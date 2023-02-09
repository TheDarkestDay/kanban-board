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
    itemId: string;
    position: DropPosition;
};

export const DraggableList: Component<Props> = (props: Props) => {
    const { store, setDragFromListIndex, stopDrag, setDragInProgress, setDraggableElement, setDragFromItemIndex, setDragToListIndex, performDrag } = useMultiDraggableListStore();
    const [moveToIndex, setMoveToIndex] = createSignal(-1);
    const [moveToPosition, setMoveToPosition] = createSignal<DropPosition>('before');
    const [lastDropAt, setLastDropAt] = createSignal<DropAt>({
        itemId: '',
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
        const { itemId } = lastDropAt();

        setOrderedElementIds((currentOrder) => {
            const currentOrderCopy = currentOrder.slice();
            const currentDraggableElementIndex = currentOrderCopy.findIndex((id) => id === store.draggableElement!.id) ?? 0;
            const dropAtElementIndex = currentOrderCopy.findIndex((id) => id === itemId);

            [currentOrderCopy[currentDraggableElementIndex], currentOrderCopy[dropAtElementIndex]] = [currentOrderCopy[dropAtElementIndex], currentOrderCopy[currentDraggableElementIndex]];

            return currentOrderCopy;
        });
    });

    const handleDragStart = (itemId: string) => {
        const elements = listItemsDomElements() as HTMLElement[];
        const draggableElement = elements.find((element) => element.id === itemId);

        setDragFromListIndex(props.index);
        setLastDropAt({
            itemId,
            position: 'before'
        });
        setDraggableElement(draggableElement!);
        setDragInProgress(true);
        setOrderedElementIds(store.itemsLists[props.index].map((item) => item.id));
    };

    const updateDropAt = (itemId: string, position: DropPosition) => {
        const { itemId: lastItemId, position: lastTrackedPosition } = lastDropAt();

        if (itemId !== lastItemId || lastTrackedPosition !== position) {
            setMoveToIndex(0);
            setMoveToPosition(position);

            setLastDropAt({ itemId, position });
        }
    }

    const handleDragOver = (itemId: string, position: DropPosition) => {
        if (isItemBeingDragged(itemId)) {
            return;
        }

        updateDropAt(itemId, position);

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

    const isItemBeingDragged = (itemId: string) => {
        return store.dragFromListIndex === props.index && itemId === store.draggableElement?.id;
    };

    const listItemsElements = createMemo(() => {
        return store.itemsLists[props.index].map((item, itemIndex) => {
            return <DragOverSensor style={{transition: 'transform .25s'}} id={item.id} component="li" direction={props.direction} onDragOver={(position) => handleDragOver(item.id, position)}>
                <Draggable style={{opacity: isItemBeingDragged(item.id) ? 0.5 : 1}} onDragStart={() => handleDragStart(item.id)} onDragEnd={handleDragEnd}>
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