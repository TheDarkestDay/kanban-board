import type { Component, JSXElement } from "solid-js";

import styles from './Button.module.css';

type Props = {
    children: JSXElement;
};

export const Button: Component<Props> = ({children}: Props) => {
    return (
        <button class={styles.root}>
            {children}
        </button>
    );
};