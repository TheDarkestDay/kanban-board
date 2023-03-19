export const debounce = <CallbackArguments extends any[]>(fn: (...args: CallbackArguments) => void, durationMs: number) => {
    let timeoutHandle: NodeJS.Timeout | null = null;

    return (...args: CallbackArguments) => {
        if (timeoutHandle != null) {
            clearTimeout(timeoutHandle);
            timeoutHandle = null;
        }

        timeoutHandle = setTimeout(() => fn(...args), durationMs);
    };
};