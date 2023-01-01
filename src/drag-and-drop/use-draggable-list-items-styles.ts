import { createSignal, JSX } from "solid-js";

export const useDraggableListItemsStyles = (itemsCount: number) => {
    const [styles, setStyles] = createSignal<JSX.CSSProperties[]>(
        Array.from({length: itemsCount}).map(() => {
            return {
                transition: 'transform .25s',
                transform: 'translate3d(0, 0, 0)'
            };
        })
    );

    return {
        styles,
        applySlideDownTransitionToElementsFrom(index: number) {
            setStyles((currentStyles) => {
                const stylesForNonAnimatedElements = currentStyles.slice(0, index).map(() => {
                    return {
                        transition: 'transform .25s',
                        transform: 'translate3d(0, 0, 0)'
                    };
                }) as JSX.CSSProperties[];

                const stylesForAnimatedElements = currentStyles.slice(index, itemsCount).map(() => {
                    return {
                        transition: 'transform .25s',
                        transform: 'translate3d(0, 126px, 0)'
                    };
                });
                
                return stylesForNonAnimatedElements.concat(stylesForAnimatedElements);
            });
        },
        reset() {
            setStyles(
                Array.from({length: itemsCount}).map(() => {
                    return {
                        transform: 'translate3d(0, 0, 0)'
                    };
                })
            );
        }
    };
};