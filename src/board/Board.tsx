import { Component, createSignal, For } from 'solid-js';
import { MultiDraggableListStoreProvider } from '../drag-and-drop/MultiDraggableListStoreProvider';

import styles from './Board.module.css';
import { Column } from './domain';
import { TasksColumn } from './TasksColumn';

export const Board: Component = () => {
    const [columns] = createSignal<Column[]>([
        {
            name: 'Todo',
            badgeColor: '#49c4e5',
            tasks: [
                {
                    title: 'Develop a UI',
                    id: '1',
                    description: '',
                    subtasks: []
                },
                {
                    title: 'Fix bugs',
                    id: '2',
                    description: '',
                    subtasks: []
                },
                {
                    title: 'Setup CI pipeline',
                    id: '9',
                    description: '',
                    subtasks: []
                },
                {
                    title: 'Add light theme',
                    id: '3',
                    description: '',
                    subtasks: []
                }
            ],
        },
        {
            name: 'Doing',
            badgeColor: '#8471f2',
            tasks: [
                {
                    title: 'Improving performance',
                    id: '4',
                    description: '',
                    subtasks: []
                },
                {
                    title: 'Choose E2E testing framework',
                    id: 'A',
                    description: '',
                    subtasks: []
                },
                {
                    title: 'Researching drag-n-drop libraries',
                    id: '5',
                    description: '',
                    subtasks: []
                }
            ],
        },
        {
            name: 'Done',
            badgeColor: '#67e2ae',
            tasks: [
                {
                    title: 'Choose a framework',
                    id: '6',
                    description: '',
                    subtasks: []
                },
            ],
        }
    ]);

    const tasks = columns().map((column) => column.tasks);

    return (
        <main class={styles.main}>
            <MultiDraggableListStoreProvider direction="block" data={tasks}>
                <For each={columns()}>
                    {(column, index) => <TasksColumn index={index()} column={column} />}
                </For>
            </MultiDraggableListStoreProvider>
        </main>
    );
};