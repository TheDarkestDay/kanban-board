import { Accessor, Component, createContext, JSXElement, useContext } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { DropPosition, ListDirection } from "./types";
import { usePointerMovementDirection } from "./use-pointer-movement-direction";

type Props = {
    children: JSXElement;
    direction: ListDirection;
    data: any[][];
};

type MultiDraggableListStore = {
    store: MultiDraggableListState;
    pointerMovementDirection: Accessor<'forward' | 'backward'>;
    setDragFromListIndex: (index: number) => void,
    setDragToListIndex: (index: number) => void,
    setDragFromItemIndex: (index: number) => void,
    setDragInProgress: (value: boolean) => void;
    stopDrag: () => void;
    performDrag: (destinationIndex: number, position: DropPosition) => void;
    setDraggableElement: (element: HTMLElement | null) => void;
};

const initialContextValue: MultiDraggableListStore = {
    store: {
        itemsLists: [],
        dragFromListIndex: 0,
        dragToListIndex: 0,
        dragFromItemIndex: 0,
        isDragInProgress: false,
        draggableElement: null
    },
    pointerMovementDirection: () => 'forward',
    setDragFromListIndex: () => {},
    setDragToListIndex: () => {},
    setDragFromItemIndex: () => {},
    setDragInProgress: () => {},
    stopDrag: () => {},
    setDraggableElement: () => {},
    performDrag: () => {}
};

export const MultiDraggableListStoreContext = createContext<MultiDraggableListStore>(initialContextValue);

type MultiDraggableListState = {
    itemsLists: any[][];
    dragToListIndex: number;
    dragFromListIndex: number;
    dragFromItemIndex: number;
    isDragInProgress: boolean;
    draggableElement: HTMLElement | null;
};

export const insertItemAt = (itemsCopy: any[], itemToInsert: any, to: number, position: DropPosition) => {
    const positionAwareIndex = position === 'before' ? to : to + 1;

    itemsCopy.splice(positionAwareIndex, 0, itemToInsert);

    return itemsCopy;
};

export const dragItemByIndex = (items: any[], from: number, to: number, position: DropPosition) => {
    const result = items.slice();

    const [elementToMove] = result.splice(from, 1);
    const indexDelta = to - from;
    const insertionIndex = indexDelta > 0 ? to - 1 : to;

    insertItemAt(result, elementToMove, insertionIndex, position);

    return result;
};

export const MultiDraggableListStoreProvider: Component<Props> = (props: Props) => {
    const [store, setStore] = createStore<MultiDraggableListState>({
        itemsLists: props.data,
        dragToListIndex: -1,
        dragFromListIndex: -1,
        dragFromItemIndex: -1,
        isDragInProgress: false,
        draggableElement: null,
    });

    const pointerMovementDirection = usePointerMovementDirection(props.direction, true);    

    const contextValue = {
        store,
        pointerMovementDirection,
        setDragFromListIndex(index: number) {
            setStore({dragFromListIndex: index});
        },
        setDragToListIndex(index: number) {
            setStore({dragToListIndex: index});
        },
        setDragFromItemIndex(index: number) {
            setStore({dragFromItemIndex: index});
        },
        setDragInProgress(value: boolean) {
            setStore({isDragInProgress: value});
        },
        stopDrag() {
            setStore(
                produce((state) => {
                    state.dragFromItemIndex = -1;
                    state.dragFromListIndex = -1;
                    state.dragToListIndex = -1;
                    state.isDragInProgress = false;
                    state.draggableElement = null;
                })
            )
        },
        setDraggableElement(draggableElement: HTMLElement | null) {
            setStore({draggableElement});
        },
        performDrag(destinationIndex: number, position: DropPosition) {
            const { dragFromListIndex, dragFromItemIndex, dragToListIndex } = store;

            setStore(
                produce((state) => {
                    if (dragFromListIndex !== dragToListIndex) {
                        const [itemToMove] = state.itemsLists[dragFromListIndex].splice(dragFromItemIndex, 1);

                        insertItemAt(state.itemsLists[dragToListIndex], itemToMove, destinationIndex, position);
                    } else {
                        state.itemsLists[dragToListIndex] = dragItemByIndex(state.itemsLists[dragToListIndex], dragFromItemIndex, destinationIndex, position);
                    }

                    state.dragFromItemIndex = -1;
                    state.dragFromListIndex = -1;
                    state.dragToListIndex = -1;
                    state.isDragInProgress = false;
                    state.draggableElement = null;
                })
            );
        }
    };

    return (
        <MultiDraggableListStoreContext.Provider value={contextValue}>
            {props.children}
        </MultiDraggableListStoreContext.Provider>
    );
};

export const useMultiDraggableListStore = () => {
    const { store, stopDrag, pointerMovementDirection, setDragFromListIndex, setDragInProgress, setDraggableElement, setDragToListIndex, setDragFromItemIndex, performDrag } = useContext(MultiDraggableListStoreContext);

    return {
        store,
        setDragFromListIndex,
        setDragToListIndex,
        setDragInProgress,
        setDragFromItemIndex,
        setDraggableElement,
        pointerMovementDirection,
        stopDrag,
        performDrag
    };
};
