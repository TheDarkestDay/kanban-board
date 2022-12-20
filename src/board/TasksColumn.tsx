import { Component, onMount } from "solid-js";
import classNames from 'classnames';

import { Column } from "./domain";
import { TaskCard } from "./TaskCard";

import styles from './TasksColumn.module.css';
import { DraggableList } from "../drag-and-drop/DraggableList";
import { useMultiDraggableListStore } from "../drag-and-drop/MultiDraggableListStoreProvider";

const cx = classNames.bind(styles);

type Props = {
    index: number;
    column: Column
};

export const TasksColumn: Component<Props> = ({ column, index }: Props) => {
    const { store } = useMultiDraggableListStore();

    const { name, badgeColor } = column;

    const tasks = store.itemsLists[index] ?? [];

    const badgeColorStyle = {
        '--badge-color': badgeColor
    };

    return (
        <div class={styles.root}>
            <h2 class={cx(styles.title, 'heading-s color-subtitle')} style={badgeColorStyle}>
                {name} ({tasks.length})
            </h2>

            <DraggableList index={index} direction="block" class={styles.tasksList} items={tasks} ItemComponent={TaskCard} />
        </div>
    );
};