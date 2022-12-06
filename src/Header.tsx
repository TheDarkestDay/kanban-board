import type { Component } from 'solid-js';
import { Logo } from './Logo';

import styles from './Header.module.css';
import { Button } from './common/Button';

export const Header: Component = () => {
    return (
        <header class={styles.root}>
            <div class={styles.sidebarExtension}>
                <Logo />
            </div>

            <div class={styles.content}>
                <h1 class={styles.heading}>
                    Platform Launch
                </h1>

                <div class={styles.actions}>
                    <Button>
                        Add new task
                    </Button>
                </div>
            </div>
        </header>
    );
};