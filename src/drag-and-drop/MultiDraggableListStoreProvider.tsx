import { Component, createContext, JSXElement, onMount, useContext } from "solid-js";
import { createStore, SetStoreFunction } from "solid-js/store";

type Props = {
    children: JSXElement;
    data: any[][];
};

const initialContextValue: MultiDraggableListStore = {
    store: {
        itemsLists: [],
    },
    setStore: () => {},
};

type MultiDraggableListStore = {
    store: MultiDraggableListState;
    setStore: SetStoreFunction<MultiDraggableListState>;
};

export const MultiDraggableListStoreContext = createContext<MultiDraggableListStore>(initialContextValue);

type MultiDraggableListState = {
    itemsLists: any[][];
};

export const MultiDraggableListStoreProvider: Component<Props> = (props: Props) => {
    const [store, setStore] = createStore<MultiDraggableListState>({
        itemsLists: props.data,
    });

    const contextValue = {
        store,
        setStore,
    };

    return (
        <MultiDraggableListStoreContext.Provider value={contextValue}>
            {props.children}
        </MultiDraggableListStoreContext.Provider>
    );
};

export const useMultiDraggableListStore = (listIndex: number) => {
    const { store, setStore } = useContext(MultiDraggableListStoreContext);

    return {
        store,
        setStore,
    };
};
