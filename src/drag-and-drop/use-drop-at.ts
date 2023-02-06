import { createSignal } from "solid-js";

import { DropPosition } from "./types";

export type DropAt = {
    index: number;
    position: DropPosition;
};

export const useDropAt = () => {
    const [dropAt, setCurrentDropAt] = createSignal<DropAt>({
        index: -1,
        position: 'before'
    });
    const [lastDropAt, setLastDropAt] = createSignal<DropAt>(dropAt());

    const setDropAt = (newDropAt: DropAt) => {
        const { index: lastDropAtIndex } = lastDropAt();
        if (lastDropAtIndex === -1) {
            setLastDropAt(newDropAt);
        } else {
            setLastDropAt(dropAt());
        }

        setCurrentDropAt(newDropAt);
    };

    return {
        dropAt,
        lastDropAt,
        setDropAt,
    };
};