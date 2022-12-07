export type Subtask = {
    id: string;
    name: string;
    isDone: boolean;
};

export type Task = {
    id: string;
    title: string;
    description: string;
    subtasks: Subtask[];
};

export type Column = {
    name: string;
    badgeColor: string;
    tasks: Task[];
};