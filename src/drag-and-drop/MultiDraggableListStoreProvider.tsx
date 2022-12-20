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
    performDrag: (draggedItemIndex: number, destinationIndex: number, position: DropPosition) => void;
};

const initialContextValue: MultiDraggableListStore = {
    store: {
        itemsLists: [],
        dragFromListIndex: -1,
        dragToListIndex: -1
    },
    setDragFromListIndex: () => {},
    setDragToListIndex: () => {},
    performDrag: () => {}
};

export const MultiDraggableListStoreContext = createContext<MultiDraggableListStore>(initialContextValue);

type MultiDraggableListState = {
    itemsLists: any[][];
    dragToListIndex: number;
    dragFromListIndex: number;
};

const insertItemAt = (itemsCopy: any[], itemToMove: any, to: number, position: DropPosition) => {
    const positionAwareIndex = position === 'before' ? to : to + 1;

    itemsCopy.splice(positionAwareIndex, 0, itemToMove);

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
    });

    const contextValue = {
        store,
        setDragFromListIndex(index: number) {
            setStore({dragFromListIndex: index});
        },
        setDragToListIndex(index: number) {
            setStore({dragToListIndex: index});
        },
        performDrag(draggedItemIndex: number, destinationIndex: number, position: DropPosition) {
            const { dragFromListIndex, dragToListIndex } = store;

            setStore(
                produce((state) => {
                    console.log(`Moving element ${draggedItemIndex} from list ${dragFromListIndex} to ${destinationIndex} of list ${dragToListIndex}`);
                    if (dragFromListIndex !== dragToListIndex) {
                        const [itemToMove] = state.itemsLists[dragFromListIndex].splice(draggedItemIndex, 1);

                        insertItemAt(state.itemsLists[dragToListIndex], itemToMove, destinationIndex, position);
                    } else {
                        state.itemsLists[dragToListIndex] = dragItemByIndex(state.itemsLists[dragToListIndex], draggedItemIndex, destinationIndex, position);
                    }
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
    const { store, setDragFromListIndex, setDragToListIndex, performDrag } = useContext(MultiDraggableListStoreContext);

    return {
        store,
        setDragFromListIndex,
        setDragToListIndex,
        performDrag
    };
};
