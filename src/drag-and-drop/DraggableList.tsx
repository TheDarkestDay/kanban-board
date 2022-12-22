import { Component, createMemo, createSignal, For, Show } from "solid-js";
import { Draggable } from "./Draggable";
import { DropTarget } from "./DropTarget";
import { useMultiDraggableListStore } from "./MultiDraggableListStoreProvider";
import { DropPosition, ListDirection } from "./types";

type Props = {
    class?: string;
    index: number;
    direction: ListDirection;
    ItemComponent: Component<any>;
};

export const DraggableList: Component<Props> = ({ class: className, ItemComponent, direction, index }) => {
    let itemElement: HTMLDivElement | undefined;

    const { store, setDragFromListIndex, setDragFromItemIndex, setDragToListIndex, performDrag } = useMultiDraggableListStore();
    const [moveToIndex, setMoveToIndex] = createSignal(-1);
    const [moveToPosition, setMoveToPosition] = createSignal<DropPosition>('before');
    const [hasExternalDrag, setHasExternalDrag] = createSignal(false);
    const [isOwnItemBeingDragged, setOwnItemBeingDragged] = createSignal(false);
    const dropZoneStyle = createMemo(() => {
        const isDragInsideThisList = hasExternalDrag() || isOwnItemBeingDragged();
        const hasDragLeft = store.dragToListIndex !== index;
        if (isDragInsideThisList && !hasDragLeft) {
            return {
                width: `${itemElement?.offsetWidth}px`,
                height: `${itemElement?.offsetHeight}px`,
                'background-color': 'red'
            };
        }

        return {
            width: 'auto',
            height: 'auto'
        }
    });


    const handleDragStart = (itemIndex: number) => {
        setDragFromItemIndex(itemIndex);
        setDragFromListIndex(index);

        setOwnItemBeingDragged(true);
    }

    const handleDragEnter = () => {
        const { width } = dropZoneStyle();

        if (width === 'auto') {
            setHasExternalDrag(true);
        }
    };

    const handleDragOver = (itemIndex: number, position: DropPosition) => {
        setMoveToIndex(itemIndex);
        setMoveToPosition(position);

        setDragToListIndex(index);
    };

    const handleDragEnd = () => {
        setMoveToIndex(-1);
    };

    const handleDrop = () => {
        const to = moveToIndex();
        const position = moveToPosition();

        performDrag(to, position);

        setMoveToIndex(-1);
        setOwnItemBeingDragged(false);
        setHasExternalDrag(false);
    };

    const isPointerBeforeItemAtIndex = (itemIndex: number) => {
        return moveToPosition() === 'before' && itemIndex === moveToIndex();
    };

    const isPointerAfterItemAtIndex = (itemIndex: number) => {
        return moveToPosition() === 'after' && itemIndex === moveToIndex();
    };

    return (
        <ul class={className}>
            <For each={store.itemsLists[index]}>
                {(item, itemIndex) =>
                    <DropTarget direction={direction} onDragEnter={handleDragEnter} onDragOver={(position) => handleDragOver(itemIndex(), position)} onDrop={handleDrop}>
                        <Show when={isPointerBeforeItemAtIndex(itemIndex())}>
                            <div style={dropZoneStyle()}></div>
                        </Show>
                        <Draggable onDragStart={() => handleDragStart(itemIndex())} onDragEnd={handleDragEnd}>
                            <ItemComponent ref={itemElement} {...item} />
                        </Draggable>
                        <Show when={isPointerAfterItemAtIndex(itemIndex())}>
                            <div style={dropZoneStyle()}></div>
                        </Show>
                    </DropTarget>}
            </For>
        </ul>
    );
};