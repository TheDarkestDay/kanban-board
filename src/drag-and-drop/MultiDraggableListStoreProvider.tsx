import { Component, createContext, JSXElement, useContext } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { ListDirection } from "./types";

type Props = {
    children: JSXElement;
    direction: ListDirection;
    data: any[][];
};

type MultiDraggableListStore = {
    store: MultiDraggableListState;
    setDragFromListIndex: (index: number) => void,
    setDragToListIndex: (index: number) => void,
    setDragFromItemIndex: (index: number) => void,
    setDragInProgress: (value: boolean) => void;
    stopDrag: () => void;
    performDrag: (orderedItemIds: string[]) => void;
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

export const insertItemAt = (itemsCopy: any[], itemToInsert: any, to: number) => {
    itemsCopy.splice(to, 0, itemToInsert);

    return itemsCopy;
};

export const dragItemByIndex = (items: any[], from: number, to: number) => {
    const result = items.slice();

    const [elementToMove] = result.splice(from, 1);
    const indexDelta = to - from;
    const insertionIndex = indexDelta > 0 ? to - 1 : to;

    insertItemAt(result, elementToMove, insertionIndex);

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
        performDrag(orderedItemIds: string[]) {
            const { dragFromListIndex, dragFromItemIndex, dragToListIndex } = store;

            setStore(
                produce((state) => {
                    if (dragFromListIndex !== dragToListIndex) {
                        const [itemToMove] = state.itemsLists[dragFromListIndex].splice(dragFromItemIndex, 1);

                        insertItemAt(state.itemsLists[dragToListIndex], itemToMove, 0);
                    } else {
                        state.itemsLists[state.dragFromListIndex] = orderedItemIds.map((id) => {
                            const item = state.itemsLists[store.dragFromListIndex].find((item) => item.id === id);

                            return item;
                        });
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
    const { store, stopDrag, setDragFromListIndex, setDragInProgress, setDraggableElement, setDragToListIndex, setDragFromItemIndex, performDrag } = useContext(MultiDraggableListStoreContext);

    return {
        store,
        setDragFromListIndex,
        setDragToListIndex,
        setDragInProgress,
        setDragFromItemIndex,
        setDraggableElement,
        stopDrag,
        performDrag
    };
};
