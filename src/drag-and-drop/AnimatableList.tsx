import { Component, createEffect, createSignal, JSXElement } from 'solid-js';
import { children } from 'solid-js';

type Props = {
    children: JSXElement
};

type ElementsOrder = Record<string, number>;

const areOrdersEqual = (orderA: Record<string, number>, orderB: Record<string, number>) => {
    const idsA = Object.keys(orderA);
    const idsB = Object.keys(orderB);
    const areElementsPositionedTheSame = idsA.every((id) => orderB[id] === orderA[id]);

    return idsA.length === idsB.length && areElementsPositionedTheSame;
};

const getElementsOrder = (list: any[]) => {
    return list.reduce((acc, current, index) => {
        acc[current.id] = index;

        return acc;
    }, {} as ElementsOrder)
};

export const AnimatableList: Component<Props> = (props: Props) => {
    const childElements = children(() => props.children);
    const [elementsList, setElementsList] = createSignal<HTMLElement[] | null>(null);

    createEffect(() => {
        const currentElements = childElements() as HTMLElement[];
        const lastSeenElements = elementsList();

        if (lastSeenElements == null) {
            setElementsList(currentElements);
            return;
        }

        const currentOrder = getElementsOrder(currentElements);
        const lastSeenOrder = getElementsOrder(lastSeenElements);

        const currentIds = Object.keys(currentOrder);
        const lastSeenIds = Object.keys(lastSeenOrder!);

        if (currentIds.length > lastSeenIds.length) {
            console.log('New element seems to be added');
            const addedItemId = currentIds.find((currentId) => !lastSeenIds.includes(currentId))!;

            const addedItemIndex = currentOrder[addedItemId];

            const slideStartIndex = addedItemIndex + 1;
        
            let remainingTransitionsCount = currentElements.length - slideStartIndex;
            for (let i = slideStartIndex; i < currentElements.length; i++) {
                const elementToSlideDown = currentElements[i];
                
                const handleTransitionEnd = () => {
                    remainingTransitionsCount--;
                    elementToSlideDown.style.transition = 'none';
                    elementToSlideDown.style.transform = 'translate3d(0, 0, 0)';
                    elementToSlideDown.removeEventListener('transitionend', handleTransitionEnd);

                    if (remainingTransitionsCount === 0) {
                        setElementsList(currentElements);
                    }
                };

                elementToSlideDown.addEventListener('transitionend', handleTransitionEnd);

                elementToSlideDown.style.transition = 'transform .25s';
                elementToSlideDown.style.transform = 'translate3d(0, 126px, 0)';
            }
        } else if (currentIds.length < lastSeenIds.length) {
            console.log('Element has been removed');
            setElementsList(currentElements);
        } else if (currentIds.length === lastSeenIds.length) {
            console.log('Elements may have been moved');
            let remainingTransitionsCount = 0;
            for (const element of lastSeenElements) {
                const lastSeenElementIndex = lastSeenOrder[element.id];
                const currentElementIndex = currentOrder[element.id];

                if (lastSeenElementIndex == null || currentElementIndex == null) {
                    setElementsList(currentElements);
                    return;
                }

                if (lastSeenElementIndex !== currentElementIndex) {
                    console.log('Item has been moved');
                    const indexDelta = currentElementIndex - lastSeenElementIndex;

                    remainingTransitionsCount += 1;
                    const handleTransitionEnd = () => {
                        remainingTransitionsCount--;
                        element.removeEventListener('transitionend', handleTransitionEnd);
                        element.style.transition = 'none';
                        element.style.transform = 'translate3d(0, 0, 0)';

                        if (remainingTransitionsCount === 0) {
                            setElementsList(currentElements);
                        }
                    };

                    element.addEventListener('transitionend', handleTransitionEnd);
                    element.style.transition = 'transform .25s';
                    element.style.transform = `translate3d(0, ${indexDelta > 0 ? '126px' : '-126px'}, 0)`;
                }
            }
        }
    });

    return elementsList;
};
