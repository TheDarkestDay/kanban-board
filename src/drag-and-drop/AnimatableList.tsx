import { Component, createEffect, createSignal, JSXElement } from 'solid-js';
import { children } from 'solid-js';

type Props = {
    children: JSXElement;
    shouldSkipRemovalAnimation?: boolean;
};

type ElementsOrder = Record<string, number>;

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
            const addedItemId = currentIds.find((currentId) => !lastSeenIds.includes(currentId))!;

            const addedItemIndex = currentOrder[addedItemId];

            const slideStartIndex = addedItemIndex + 1;
        
            let remainingTransitionsCount = currentElements.length - slideStartIndex;
            if (remainingTransitionsCount === 0) {
                setElementsList(currentElements);
                return;
            }

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
            if (props.shouldSkipRemovalAnimation) {
                setElementsList(currentElements);
                return;
            }

            const removedItemId = lastSeenIds.find((lastSeenId) => !currentIds.includes(lastSeenId))!;
            const removedItemIndex = lastSeenOrder[removedItemId];
            const slideStartIndex = removedItemIndex + 1;
        
            let remainingTransitionsCount = lastSeenElements.length - slideStartIndex;
            if (remainingTransitionsCount === 0) {
                setElementsList(currentElements);
                return;
            }

            const removedItem = lastSeenElements[removedItemIndex];
            removedItem.style.opacity = '0';

            for (let i = slideStartIndex; i < lastSeenElements.length; i++) {
                const elementToSlideUp = lastSeenElements[i];
                
                const handleTransitionEnd = () => {
                    remainingTransitionsCount--;
                    elementToSlideUp.style.transition = 'none';
                    elementToSlideUp.style.transform = 'translate3d(0, 0, 0)';
                    elementToSlideUp.removeEventListener('transitionend', handleTransitionEnd);

                    if (remainingTransitionsCount === 0) {
                        setElementsList(currentElements);
                    }
                };

                elementToSlideUp.addEventListener('transitionend', handleTransitionEnd);

                elementToSlideUp.style.transition = 'transform .25s';
                elementToSlideUp.style.transform = 'translate3d(0, -126px, 0)';
            }
        } else if (currentIds.length === lastSeenIds.length) {
            let remainingTransitionsCount = 0;
            let areListsTheSame = true;

            for (const element of lastSeenElements) {
                const lastSeenElementIndex = lastSeenOrder[element.id];
                const currentElementIndex = currentOrder[element.id];

                if (lastSeenElementIndex == null || currentElementIndex == null) {
                    setElementsList(currentElements);
                    return;
                }

                if (lastSeenElementIndex !== currentElementIndex) {
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

                    if (areListsTheSame) {
                        areListsTheSame = false;
                    }
                }
            }

            if (areListsTheSame) {
                setElementsList(currentElements);
            }
        }
    });

    return elementsList;
};
