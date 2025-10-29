"use client";

import GanttChart from "@/components/GanttChart";
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
        { id: 0, name: "Kickoff", duration: 1, dependencies: [], position: { row: 0, col: 0 } },
        { id: 1, name: "Anforderungsanalyse", duration: 3, dependencies: [0], position: { row: 0, col: 2 } },
        { id: 2, name: "Systementwurf", duration: 2, dependencies: [1], position: { row: 0, col: 4 } },
        { id: 3, name: "Implementierung", duration: 5, dependencies: [2], position: { row: 0, col: 6 } },
        { id: 4, name: "Code Review", duration: 3, dependencies: [3], position: { row: 0, col: 8 } },
        { id: 5, name: "Test", duration: 4, dependencies: [3], position: { row: 2, col: 8 } },
        { id: 6, name: "Deployment", duration: 1, dependencies: [4], position: { row: 1, col: 8 } },
        { id: 7, name: "Abnahme", duration: 1, dependencies: [6], position: { row: 0, col: 10 } },
    ];

    const { tasks, computedTasks, actions } = useNetzplan(initial);

    return (
        <div className="p-4 flex space-x-2">
            <TaskInput tasks={tasks} actions={actions} />
            <div className="flex flex-col space-y-4 w-full">
                <Nodes tasks={computedTasks} />
                <GanttChart tasks={computedTasks} />
            </div>
        </div>
    );
}
