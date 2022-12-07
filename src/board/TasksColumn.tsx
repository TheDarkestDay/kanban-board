import { Component } from "solid-js";
import classNames from 'classnames';

import { Column } from "./domain";
import { TaskCard } from "./TaskCard";

import styles from './TasksColumn.module.css';

const cx = classNames.bind(styles);

type Props = {
    column: Column
};

export const TasksColumn: Component<Props> = ({column}: Props) => {
    const { name, tasks } = column;

    return (
        <div class={styles.root}>
            <h2 class={cx(styles.title, 'heading-s')}>
                {name}
            </h2>

            <ul>
                {
                    tasks.map((task) => <TaskCard task={task} />)
                }                
            </ul>
        </div>
    );
};