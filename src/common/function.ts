export const debounce = (fn: (...args: any[]) => void, durationMs: number) => {
    let timeoutHandle: NodeJS.Timeout | null = null;

    return () => {
        if (timeoutHandle != null) {
            clearTimeout(timeoutHandle);
            timeoutHandle = null;
        }

        timeoutHandle = setTimeout(fn, durationMs);
    };
};