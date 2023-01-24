import { Component, createEffect, createMemo, createSignal, JSXElement } from 'solid-js';
import { children } from 'solid-js';

type Props = {
    children: JSXElement
};

type ElementsOrder = Record<string, number>;

export const AnimatableList: Component<Props> = (props: Props) => {
    const childElements = children(() => props.children);
    const [elementsOrder, setElementsOrder] = createSignal<ElementsOrder | null>(null);
    const [renderElementsIndexes, setRenderedElementsIndexes] = createSignal<number[]>([]);
    const [isAnimatingChange, setAnimatingChange] = createSignal(false);

    createEffect(() => {
        console.log('Starting effect');
        if (isAnimatingChange()) {
            console.log('Animation is in progress - returning');
            return;
        }

        const elements = childElements() as HTMLElement[];
        const currentOrder = elements.reduce((acc, current, index) => {
            acc[current.id] = index;

            return acc;
        }, {} as ElementsOrder);
        const lastSeenOrder = elementsOrder();

        if (lastSeenOrder == null) {
            console.log('Saving order for the first time');
            setElementsOrder(currentOrder);
            setRenderedElementsIndexes(elements.map((_, index) => index));

            return;
        }

        const currentIds = Object.keys(currentOrder);
        const lastSeenIds = Object.keys(lastSeenOrder!);
        const isOrderTheSame = currentIds.every((currentId) => lastSeenOrder[currentId] === currentOrder[currentId]);

        if (currentIds.length === lastSeenIds.length && isOrderTheSame) {
            console.log('Stopping because order is the same');
            return;
        }

        console.log('Comparing order');

        if (currentIds.length > lastSeenIds.length) {
            console.log('Item has been added');
            setAnimatingChange(true);
            let transitionsInProgressCount = 0;

            const addedItemId = currentIds.find((currentId) => !lastSeenIds.includes(currentId))!;

            const addedItemIndex = currentOrder[addedItemId];

            const slideStartIndex = addedItemIndex + 1;
            for (let i = slideStartIndex; i < elements.length; i++) {
                const elementToSlideDown = elements[i];

                transitionsInProgressCount += 1;
                
                const handleTransitionEnd = () => {
                    console.log('transition end fired');
                    elementToSlideDown.removeEventListener('transitionend', handleTransitionEnd);
                    elementToSlideDown.removeAttribute('style');
                    transitionsInProgressCount--;

                    if (transitionsInProgressCount === 0) {    
                        setRenderedElementsIndexes(elements.map((_, index) => index));
                        setAnimatingChange(false);
                    }
                };
                elementToSlideDown.addEventListener('transitionend', handleTransitionEnd);

                elementToSlideDown.setAttribute('style', 'transition: transform .25s; transform: translate3d(0, 126px, 0)');
            }

            setRenderedElementsIndexes(elements.map((_, index) => index).filter((index) => index !== addedItemIndex));
        } else if (currentIds.length < lastSeenIds.length) {
            console.log('Item has been deleted');
            setRenderedElementsIndexes(elements.map((_, index) => index));
        } // else {
        //     console.log('Item has been moved');
        //     let transitionsInProgressCount = 0;
        //     for (const elementId of Object.keys(currentOrder)) {
        //         const movedElementLastIndex = lastSeenOrder[elementId];
        //         const movedElementCurrentIndex = currentOrder[elementId];

        //         if (movedElementCurrentIndex !== movedElementLastIndex) {
        //             transitionsInProgressCount += 1;
        //             const elementToAnimate = elements[movedElementCurrentIndex];
        //             const indexDelta = movedElementLastIndex - movedElementCurrentIndex;

        //             const handleTransitionEnd = () => {
        //                 transitionsInProgressCount--;

        //                 if (transitionsInProgressCount === 0) {
        //                     elementToAnimate.removeAttribute('style');
        //                 }

        //                 setRenderedElementsIndexes(elements.map((_, index) => index));
        //                 elementToAnimate.removeEventListener('transitionend', handleTransitionEnd);
        //             };

        //             elementToAnimate.addEventListener('transitionend', handleTransitionEnd);

        //             const shiftValue = indexDelta > 0 ? -126 : 126;
        //             elementToAnimate.setAttribute('style', `transition: transform .25s; transform: translate3d(0, ${shiftValue}px, 0)`);
        //         }
        //     }
        // }
    });

    const renderedElements = createMemo(() => {
        const elements = childElements() as HTMLElement[];

        return renderElementsIndexes().map((index) => {
            return elements![index];
        })
    });

    return renderedElements;
};
