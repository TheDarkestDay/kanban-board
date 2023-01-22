import { Component, createEffect, createMemo, createSignal, JSXElement } from 'solid-js';
import { children } from 'solid-js';
import { useDraggableListItemsStyles } from './use-draggable-list-items-styles';


type Props = {
    children: JSXElement
};

type ElementsOrder = Record<string, number>;

export const AnimatableList: Component<Props> = (props: Props) => {
    const childElements = children(() => props.children);
    const [elementsOrder, setElementsOrder] = createSignal<ElementsOrder | null>(null);
    const [renderElementsIndexes, setRenderedElementsIndexes] = createSignal<number[]>([]);

    createEffect(() => {
        const elements = childElements() as HTMLElement[];
        const currentOrder = elements.reduce((acc, current, index) => {
            acc[current.id] = index;

            return acc;
        }, {} as ElementsOrder);

        if (elementsOrder() == null) {
            setElementsOrder(currentOrder);
            setRenderedElementsIndexes(elements.map((_, index) => index));
        } else {
            const currentIds = Object.keys(currentOrder);
            const lastSeenIds = Object.keys(elementsOrder()!);

            if (currentIds.length > lastSeenIds.length) {
                const addedItemId = currentIds.find((currentId) => !lastSeenIds.includes(currentId))!;

                const addedItemIndex = currentOrder[addedItemId];

                const slideStartIndex = addedItemIndex + 1;
                for (let i = slideStartIndex; i < elements.length; i++) {
                    const elementToSlideDown = elements[i];

                    elementToSlideDown.setAttribute('style', 'transition: transform .25s; transform: translate3d(0, 126px, 0)');
                    if (i === slideStartIndex) {
                        const handleTransitionEnd = () => {
                            setRenderedElementsIndexes(elements.map((_, index) => index));
                            elementToSlideDown.removeEventListener('transitionend', handleTransitionEnd);

                            for (let j = slideStartIndex; j < elements.length; j++) {
                                elements[j].removeAttribute('style');
                            }
                        };
                        elementToSlideDown.addEventListener('transitionend', handleTransitionEnd);
                    }
                }

                setRenderedElementsIndexes(elements.map((_, index) => index).filter((index) => index !== addedItemIndex));
            } else {
                setRenderedElementsIndexes(elements.map((_, index) => index));
            }
        }
    });

    const renderedElements = createMemo(() => {
        const elements = childElements() as HTMLElement[];

        return renderElementsIndexes().map((index) => {
            return elements![index];
        })
    });

    return renderedElements;
};
