import { Component, createContext, JSXElement, useContext } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { DropPosition } from "./types";

type Props = {
    children: JSXElement;
    data: any[][];
};

type MultiDraggableListStore = {
    store: MultiDraggableListState;
    setDragFromListIndex: (index: number) => void,
    setDragToListIndex: (index: number) => void,
    setDragFromItemIndex: (index: number) => void,
    setDraggableElementSizes: (width: number, height: number) => void;
    setDragInProgress: (value: boolean) => void;
    stopDrag: () => void;
    performDrag: (destinationIndex: number, position: DropPosition) => void;
};

const initialContextValue: MultiDraggableListStore = {
    store: {
        itemsLists: [],
        dragFromListIndex: 0,
        dragToListIndex: 0,
        dragFromItemIndex: 0,
        draggableElementWidth: null,
        draggableElementHeight: null,
        isDragInProgress: false,
    },
    setDragFromListIndex: () => {},
    setDragToListIndex: () => {},
    setDragFromItemIndex: () => {},
    setDraggableElementSizes: () => {},
    setDragInProgress: () => {},
    stopDrag: () => {},
    performDrag: () => {}
};

export const MultiDraggableListStoreContext = createContext<MultiDraggableListStore>(initialContextValue);

type MultiDraggableListState = {
    itemsLists: any[][];
    dragToListIndex: number;
    dragFromListIndex: number;
    dragFromItemIndex: number;
    isDragInProgress: boolean;
    draggableElementWidth: number | null;
    draggableElementHeight: number | null;
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
        draggableElementHeight: null,
        draggableElementWidth: null,
        isDragInProgress: false,
    });

    const contextValue = {
        store,
        setDragFromListIndex(index: number) {
            setStore({dragFromListIndex: index});
        },
        setDragToListIndex(index: number) {
            setStore({dragToListIndex: index});
        },
        setDragFromItemIndex(index: number) {
            setStore({dragFromItemIndex: index});
        },
        setDraggableElementSizes(width: number, height: number) {
            setStore({draggableElementWidth: width, draggableElementHeight: height});
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
                })
            )
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
    const { store, stopDrag, setDragFromListIndex, setDragInProgress, setDragToListIndex, setDraggableElementSizes, setDragFromItemIndex, performDrag } = useContext(MultiDraggableListStoreContext);

    return {
        store,
        setDragFromListIndex,
        setDragToListIndex,
        setDragInProgress,
        setDragFromItemIndex,
        setDraggableElementSizes,
        stopDrag,
        performDrag
    };
};
