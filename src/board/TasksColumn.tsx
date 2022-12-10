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
    const { name, tasks, badgeColor } = column;

    const badgeColorStyle = {
        '--badge-color': badgeColor
    };

    return (
        <div class={styles.root}>
            <h2 class={cx(styles.title, 'heading-s color-subtitle')} style={badgeColorStyle}>
                {name} ({tasks.length})
            </h2>

            <ul class={styles.tasksList}>
                {
                    tasks.map((task) => <TaskCard task={task} />)
                }                
            </ul>
        </div>
    );
};