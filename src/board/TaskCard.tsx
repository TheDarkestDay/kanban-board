import { Component } from "solid-js";
import classNames from "classnames";

import { Task } from "./domain";
import styles from './TaskCard.module.css';

const cx = classNames.bind(styles);

type Props = {
    task: Task
};

export const TaskCard: Component<Props> = ({task}: Props) => {
    const { title, subtasks } = task;

    return (
        <article class={styles.root}>
            <h3 class={cx(styles.title, "heading-m color-body")}>
                {title}
            </h3>
            <p class="color-subtitle body-m">
                1 of {subtasks.length}
            </p>
        </article>
    );
};