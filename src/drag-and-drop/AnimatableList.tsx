import { Component, createEffect, createMemo, createSignal, JSXElement } from 'solid-js';
import { children } from 'solid-js';

type Props = {
    children: JSXElement
};

type ElementsOrder = Record<string, number>;

export const log = (message: string) => {
    const div = document.createElement('div');
    div.textContent = message;
    document.body.append(div);
};

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
        log(`There are ${elements.length} elements`);
        log('===========');
        const currentOrder = elements.reduce((acc, current, index) => {
            acc[current.id] = index;
            log(`${current.id} is at ${index}`);

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

        if ((currentIds.length === lastSeenIds.length) && isOrderTheSame) {
            return;
        }

        if (currentIds.length > lastSeenIds.length) {
            setAnimatingChange(true);
            let transitionsInProgressCount = 0;

            const addedItemId = currentIds.find((currentId) => !lastSeenIds.includes(currentId))!;

            const addedItemIndex = currentOrder[addedItemId];

            const slideStartIndex = addedItemIndex + 1;
            for (let i = slideStartIndex; i < elements.length; i++) {
                const elementToSlideDown = elements[i];
                
                if (i === slideStartIndex) {
                    const handleTransitionEnd = () => {
                        elementToSlideDown.removeEventListener('transitionend', handleTransitionEnd);
                        elementToSlideDown.style.transform = 'translate3d(0, 0, 0)';
                        
                        log(`${transitionsInProgressCount} transitions remaining`);
                        setRenderedElementsIndexes(elements.map((_, index) => index));
                        log(`Requesting to show all elements`);
                        setAnimatingChange(false);
                        setElementsOrder(currentOrder);
                    };
                    log(`Sliding element ${elements[i].id}`);
                    elementToSlideDown.addEventListener('transitionend', handleTransitionEnd);
                }

                elementToSlideDown.style.transform = 'translate3d(0, 126px, 0)';
            }

            log('Show only elements without one added');
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
