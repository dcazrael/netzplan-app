import type { TaskTemplate } from "@/constants/taskTemplates";
import { updateTaskPositions } from "@/lib/autoLayout";
import { calculateSchedule } from "@/lib/schedule";
import type { Task as RawTask, ScheduledTask } from "@/types/task";
import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * Represents the set of actions available for managing a Netzplan (network plan/PERT chart).
 *
 * @typedef {Object} NetzplanActions
 * @property {() => void} addTask - Adds a new task to the Netzplan.
 * @property {(id: number) => void} removeTask - Removes a task from the Netzplan by its ID.
 * @property {(id: number, name: string) => void} updateName - Updates the name of a task identified by its ID.
 * @property {(id: number, duration: number) => void} updateDuration - Updates the duration of a task identified by its ID.
 * @property {(id: number, depId: number) => void} addDependency - Adds a dependency relationship between two tasks by their IDs.
 * @property {(id: number, depId: number) => void} removeDependency - Removes a dependency relationship between two tasks by their IDs.
 */
export type NetzplanActions = {
    addTask: () => void;
    removeTask: (id: number) => void;
    updateName: (id: number, name: string) => void;
    updateDuration: (id: number, duration: number) => void;
    addDependency: (id: number, depId: number) => void;
    removeDependency: (id: number, depId: number) => void;
    addTaskFromTemplate: (tpl: TaskTemplate) => void;
};

/**
 * Determines if there is a path from one task to another through their dependencies.
 * Uses depth-first search (DFS) to traverse the dependency graph.
 *
 * @param tasks - Array of tasks to search through
 * @param fromId - The starting task ID
 * @param toId - The target task ID
 * @returns `true` if a path exists from fromId to toId through dependencies, `false` otherwise
 */
function hasPath(tasks: RawTask[], fromId: number, toId: number): boolean {
    // DFS entlang dependencies-Kanten
    const visited = new Set<number>();
    const stack = [fromId];
    while (stack.length) {
        const cur = stack.pop()!;
        if (cur === toId) return true;
        if (visited.has(cur)) continue;
        visited.add(cur);
        const node = tasks.find((t) => t.id === cur);
        if (!node) continue;
        node.dependencies.forEach((d) => stack.push(d));
    }
    return false;
}

const STORAGE_KEY = "netzplan.tasks";

/**
 * Represents the initial set of raw tasks for the Netzplan, including their IDs,
 * German-language labels, durations, dependency relationships, and grid positions
 * (row/column) to support the default project workflow configuration.
 */
const DEFAULT_TASKS: RawTask[] = [
    { id: 1, name: "Anforderungsanalyse", duration: 3, dependencies: [0], position: { row: 0, col: 2 } },
    { id: 2, name: "Systementwurf", duration: 2, dependencies: [1], position: { row: 0, col: 4 } },
    { id: 3, name: "Implementierung", duration: 5, dependencies: [2], position: { row: 0, col: 6 } },
    { id: 4, name: "Code Review", duration: 3, dependencies: [3], position: { row: 0, col: 8 } },
    { id: 5, name: "Test", duration: 4, dependencies: [3], position: { row: 1, col: 8 } },
    { id: 6, name: "Deployment", duration: 1, dependencies: [4], position: { row: 0, col: 10 } },
    { id: 7, name: "Abnahme", duration: 1, dependencies: [6], position: { row: 0, col: 12 } },
];

const hydrateTasks = (list: RawTask[]): RawTask[] =>
    updateTaskPositions(list.map((t) => ({ ...t, position: { ...t.position } })));

/**
 * Custom hook for managing a Netzplan (network diagram) with tasks and their dependencies.
 *
 * @param initial - Optional array of initial tasks. If not provided, uses default sample tasks.
 * @returns An object containing:
 *   - `tasks` - The current array of tasks
 *   - `computedTasks` - Memoized computed schedule based on task dependencies and durations
 *   - `actions` - Object containing action callbacks:
 *     - `addTask` - Adds a new task with auto-generated ID, optionally depending on the last task
 *     - `removeTask` - Removes a task by ID and updates all dependent tasks
 *     - `updateName` - Updates a task's name by ID
 *     - `updateDuration` - Updates a task's duration by ID (minimum 1)
 *     - `addDependency` - Adds a dependency between tasks with cycle detection
 *     - `removeDependency` - Removes a dependency between tasks
 *
 * @remarks
 * - All state updates automatically recalculate task positions via `updateTaskPositions`
 * - Cycle detection prevents circular dependencies
 * - Self-dependencies are prevented
 * - Positions are auto-layout after any modification
 */
export function useNetzplan(initial?: RawTask[]) {
    const [tasks, setTasks] = useState<RawTask[]>(() => {
        if (initial?.length) return hydrateTasks(initial);
        if (typeof window !== "undefined") {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored) as RawTask[];
                    if (Array.isArray(parsed) && parsed.length) return hydrateTasks(parsed);
                }
            } catch {
                /* ignore */
            }
        }
        return hydrateTasks(DEFAULT_TASKS);
    });

    const setWithLayout = useCallback((updater: (prev: RawTask[]) => RawTask[]) => {
        setTasks((prev) => updateTaskPositions(updater(prev)));
    }, []);

    const addTask = useCallback(() => {
        setWithLayout((prev) => {
            const maxId = prev.length ? Math.max(...prev.map((t) => t.id)) : -1;
            const last = prev.at(-1);
            return [
                ...prev,
                {
                    id: maxId + 1,
                    name: "",
                    duration: 1,
                    dependencies: last ? [last.id] : [],
                    position: { row: 0, col: 0 },
                },
            ];
        });
    }, [setWithLayout]);

    const removeTask = useCallback(
        (id: number) => {
            setWithLayout((prev) =>
                prev
                    .filter((t) => t.id !== id)
                    .map((t) => ({ ...t, dependencies: t.dependencies.filter((d) => d !== id) }))
            );
        },
        [setWithLayout]
    );

    const updateName = useCallback(
        (id: number, name: string) => {
            setWithLayout((prev) => prev.map((t) => (t.id === id ? { ...t, name } : t)));
        },
        [setWithLayout]
    );

    const updateDuration = useCallback(
        (id: number, duration: number) => {
            const d = Math.max(1, Math.floor(duration || 1));
            setWithLayout((prev) => prev.map((t) => (t.id === id ? { ...t, duration: d } : t)));
        },
        [setWithLayout]
    );

    const addDependency = useCallback(
        (id: number, depId: number) => {
            setWithLayout((prev) => {
                if (id === depId) return prev;
                const task = prev.find((t) => t.id === id);
                const dep = prev.find((t) => t.id === depId);
                if (!task || !dep) return prev;
                // Zyklus, wenn depId bereits (direkt/indirekt) von id abhängig ist? Wir prüfen depId -> id.
                if (hasPath(prev, depId, id)) return prev;
                const deps = new Set(task.dependencies);
                deps.add(depId);
                return prev.map((t) => (t.id === id ? { ...t, dependencies: [...deps] } : t));
            });
        },
        [setWithLayout]
    );

    const removeDependency = useCallback(
        (id: number, depId: number) => {
            setWithLayout((prev) =>
                prev.map((t) => (t.id === id ? { ...t, dependencies: t.dependencies.filter((d) => d !== depId) } : t))
            );
        },
        [setWithLayout]
    );

    const addTaskFromTemplate = useCallback(
        (tpl: TaskTemplate) => {
            setWithLayout((prev) => {
                const maxId = prev.length ? Math.max(...prev.map((t) => t.id)) : -1;
                const last = prev.at(-1);
                return [
                    ...prev,
                    {
                        id: maxId + 1,
                        name: tpl.name,
                        duration: Math.max(1, Math.floor(tpl.duration || 1)),
                        dependencies: last ? [last.id] : [],
                        position: { row: 0, col: 0 },
                    },
                ];
            });
        },
        [setWithLayout]
    );

    const computedTasks: ScheduledTask[] = useMemo(() => calculateSchedule(tasks), [tasks]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        } catch {
            /* ignore */
        }
    }, [tasks]);

    return {
        tasks,
        computedTasks,
        actions: {
            addTask,
            removeTask,
            updateName,
            updateDuration,
            addDependency,
            removeDependency,
            addTaskFromTemplate,
        },
    };
}
