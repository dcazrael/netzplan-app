"use client";

import Nodes from "@/components/Nodes";
import TaskInput from "@/components/TaskInput";
import { useNetzplan } from "@/hooks/useNetzplan";

/**
 * Netzplan component for visualizing and managing project tasks with dependencies.
 *
 * Initializes a network plan with sample tasks (Task A through Task E) that have
 * defined durations and inter-task dependencies. Uses the `useNetzplan` hook to
 * manage task state and computed metrics.
 *
 * @component
 * @returns {JSX.Element} A flex container displaying the task input form and
 *                        visual node representation of the task network.
 *
 * @example
 * return <Netzplan />
 */
export default function Netzplan() {
    const initial = [
        { id: 0, name: "Task A", duration: 2, dependencies: [], position: { row: 0, col: 0 } },
        { id: 1, name: "Task B", duration: 4, dependencies: [0], position: { row: 0, col: 2 } },
        { id: 2, name: "Task C", duration: 4, dependencies: [1], position: { row: 0, col: 4 } },
        { id: 3, name: "Task D", duration: 2, dependencies: [1], position: { row: 1, col: 4 } },
        { id: 4, name: "Task E", duration: 4, dependencies: [2, 3], position: { row: 0, col: 6 } },
    ];

    const { tasks, computedTasks, actions } = useNetzplan(initial);

    return (
        <div className="p-4 flex space-y-2 flex-col h-screen w-screen">
            <Nodes tasks={computedTasks} />
            <TaskInput tasks={tasks} actions={actions} />
        </div>
    );
}
