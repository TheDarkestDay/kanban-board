import { Component, createContext, JSXElement, onMount, useContext } from "solid-js";
import { createStore, SetStoreFunction } from "solid-js/store";

type Props = {
    children: JSXElement;
    data: any[][];
};

const initialContextValue: ContextValue = {
    itemsLists: [],
    setStore: () => {},
};

type ContextValue = {
    itemsLists: any[][];
    setStore: SetStoreFunction<MultiDraggableListStore>;
};

export const MultiDraggableListStoreContext = createContext<ContextValue>(initialContextValue);

type MultiDraggableListStore = {
    itemsLists: any[][];
};

export const MultiDraggableListStoreProvider: Component<Props> = ({children, data}: Props) => {
    const [store, setStore] = createStore<MultiDraggableListStore>({
        itemsLists: data,
    });

    onMount(() => {
        setStore({itemsLists: data});
    });

    const contextValue = {
        itemsLists: store.itemsLists,
        setStore,
    };

    return (
        <MultiDraggableListStoreContext.Provider value={contextValue}>
            {children}
        </MultiDraggableListStoreContext.Provider>
    );
};

export const useMultiDraggableListStore = (listIndex: number) => {
    const { itemsLists, setStore } = useContext(MultiDraggableListStoreContext);

    return {
        items: itemsLists[listIndex] ?? [],
        setStore,
    };
};
