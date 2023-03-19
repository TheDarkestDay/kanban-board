import { children, Component, createEffect, createMemo, createSignal } from "solid-js";
import { AnimatableList } from "./AnimatableList";
import { Draggable } from "./Draggable";
import { DragOverSensor } from "./DragOverSensor";
import { DropTarget } from "./DropTarget";
import { useMultiDraggableListStore } from "./MultiDraggableListStoreProvider";
import { ListDirection } from "./types";

type Props = {
    class?: string;
    index: number;
    direction: ListDirection;
    ItemComponent: Component<any>;
};

type DropAt = {
    itemId: string | null;
};

export const DraggableList: Component<Props> = (props: Props) => {
    const { store, setDragFromListIndex, stopDrag, setDragInProgress, setDraggableElement, setDragToListIndex, performDrag } = useMultiDraggableListStore();
    const [dropAtItemId, setDropAtItemId] = createSignal<DropAt>({
        itemId: null
    });
    const [isDragHandledByChildSensors, setDragHandledByChildSensors] = createSignal(false);
    const isDragInsideThisList = createMemo(() => store.dragToListIndex === props.index);
    const [orderedElementIds, setOrderedElementIds] = createSignal<string[]>(
        store.itemsLists[props.index].map((item) => item.id)
    );

    createEffect(() => {
        if (!isDragInsideThisList()) {
            setDragHandledByChildSensors(false);
        }
    });

    const isElementDraggedOutsideOfThisList = createMemo(() => {
        return store.dragFromListIndex === props.index && store.dragToListIndex !== props.index;
    });

    createEffect(() => {
        const { itemId } = dropAtItemId();

        if (store.draggableElement == null || itemId == null) {
            return;
        }

        setOrderedElementIds((currentOrder) => {
            const currentOrderCopy = currentOrder.slice();
            const currentDraggableElementIndex = currentOrderCopy.findIndex((id) => id === store.draggableElement?.id) ?? 0;
            const dropAtElementIndex = currentOrderCopy.findIndex((id) => id === itemId);

            if (isElementDraggedOutsideOfThisList()) {
                currentOrderCopy.splice(currentDraggableElementIndex, 1);
            } else if (currentDraggableElementIndex === -1) {
                currentOrderCopy.splice(dropAtElementIndex, 0, store.draggableElement!.id);
            } else {
                [currentOrderCopy[currentDraggableElementIndex], currentOrderCopy[dropAtElementIndex]] = [currentOrderCopy[dropAtElementIndex], currentOrderCopy[currentDraggableElementIndex]];
            }

            return currentOrderCopy;
        });
    });

    const handleDragStart = (itemId: string) => {
        const elements = listItemsDomElements() as HTMLElement[];
        const draggableElement = elements.find((element) => element.id === itemId);

        setDragFromListIndex(props.index);
        setDropAtItemId({itemId: draggableElement!.id});
        setDraggableElement(draggableElement!);
        setDragInProgress(true);
        setOrderedElementIds(store.itemsLists[props.index].map((item) => item.id));
    };

    const handleDragOver = (itemId: string) => {
        if (isItemBeingDragged(itemId)) {
            return;
        }

        setDropAtItemId({itemId});

        setDragHandledByChildSensors(true);
        setDragToListIndex(props.index);
    };

    const handleDragEnd = () => {
        console.log('Drag ended');
        setDropAtItemId({itemId: null});
        stopDrag();
    };

    const handleDrop = () => {
        console.log('Dropped');
        const lastRecordedMoveToList = store.dragToListIndex;

        const currentElementIds = orderedElementIds();

        if (lastRecordedMoveToList !== props.index) {
            setDragToListIndex(props.index);

            performDrag(currentElementIds);
        } else {
            performDrag(currentElementIds);
        }

        setDropAtItemId({itemId: null});
    };

    const handleListDragEnter = () => {
        if (isDragHandledByChildSensors()) {
            return;
        }

        setDragToListIndex(props.index);
    };

    const isItemBeingDragged = (itemId: string) => {
        return store.dragFromListIndex === props.index && itemId === store.draggableElement?.id;
    };

    const getDragOverAnticipationPosition = (itemId: string) => {
        if (store.draggableElement == null) {
            return "before";
        }

        const currentOrderOfIds = orderedElementIds();
        const itemIdIndex = currentOrderOfIds.findIndex((id) => id === itemId);
        const draggableItemIdIndex = currentOrderOfIds.findIndex((id) => id === store.draggableElement!.id);

        if (draggableItemIdIndex === -1) {
            return "before";
        }

        return draggableItemIdIndex > itemIdIndex ? "after" : "before";
    };

    const listItemsElements = createMemo(() => {
        return store.itemsLists[props.index].map((item) => {
            return <DragOverSensor style={{transition: 'transform .25s'}} waitForDragOverFrom={getDragOverAnticipationPosition(item.id)} id={item.id} component="li" direction={props.direction} onDragOver={() => handleDragOver(item.id)}>
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

                if (element == null) {
                    return store.draggableElement;
                }

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