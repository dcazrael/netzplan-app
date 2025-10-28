"use client";

import { TASK_TEMPLATES } from "@/constants/taskTemplates";
import { NetzplanActions } from "@/hooks/useNetzplan";
import { Task } from "@/types/task";
import { useRef, useState } from "react";

type TaskInputProps = {
    tasks: Task[];
    actions: NetzplanActions;
};

/**
 * TaskInput component renders a form for managing a list of tasks, allowing users to input task names, durations,
 * and dependencies between tasks. Each task can have its name and duration edited, dependencies added or removed,
 * and the task itself can be deleted. New tasks can also be added.
 *
 * @param tasks - An array of task objects, each containing an id, name, duration, and dependencies.
 * @param actions - An object containing action handlers for updating task names and durations, adding/removing dependencies, and adding/removing tasks.
 *
 * @returns A React element that displays the task input form with interactive controls for managing tasks and their dependencies.
 */
export default function TaskInput({ tasks, actions }: TaskInputProps) {
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const [selectedTpl, setSelectedTpl] = useState<string>("");

    const handleAddFromTemplate = (key: string) => {
        const tpl = TASK_TEMPLATES.find((t) => t.key === key);
        if (!tpl) return;
        actions.addTaskFromTemplate(tpl);
        setSelectedTpl(""); // zurücksetzen
    };

    return (
        <div className="p-4 border rounded bg-gray-800 min-w-fit w-1/2">
            <h2 className="font-bold mb-2 text-lg text-center">Task-Eingabe</h2>

            <div className="flex items-center gap-2 mb-3 w-7/12 mx-auto">
                <select
                    className="border bg-gray-200 text-gray-900 p-1 rounded flex-1 h-8"
                    value={selectedTpl}
                    onChange={(e) => {
                        setSelectedTpl(e.target.value);
                        if (e.target.value) handleAddFromTemplate(e.target.value);
                    }}
                >
                    <option value="">+ Aus Vorlage hinzufügen…</option>
                    {TASK_TEMPLATES.map((tpl) => (
                        <option key={tpl.key} value={tpl.key}>
                            {tpl.name} (Dauer: {tpl.duration})
                        </option>
                    ))}
                </select>

                <button
                    onClick={() => actions.addTask()}
                    className="bg-blue-500 text-white px-3 py-2 rounded-md h-8 flex items-center justify-center"
                    title="+ Leeren Task hinzufügen"
                >
                    + Task
                </button>
            </div>

            <div className="flex space-x-2 mb-2 items-center">
                <span className="w-1/12 text-center font-bold">ID</span>
                <span className="w-1/3 text-center font-bold">Task</span>
                <span className="w-10 text-center font-bold">Dauer</span>
                <span className="w-1/3 text-center font-bold">Abhängigkeit</span>
            </div>

            {tasks.map((task) => (
                <div key={task.id} className="flex space-x-2 mb-2 items-center">
                    <span className="w-1/12 text-center font-bold">{task.id}</span>
                    <input
                        type="text"
                        className="border p-1 w-1/3 bg-gray-400 text-gray-800 h-8"
                        placeholder="Taskname"
                        value={task.name}
                        onChange={(e) => actions.updateName(task.id, e.target.value)}
                    />
                    <input
                        type="number"
                        className="border p-1 w-12 bg-gray-400 text-gray-800 h-8"
                        placeholder="Dauer"
                        value={task.duration}
                        min="1"
                        onChange={(e) => actions.updateDuration(task.id, Number(e.target.value))}
                    />
                    {task.id > 0 && (
                        <div className="relative w-1/3" ref={dropdownRef}>
                            <div
                                className="border p-1 cursor-pointer w-full bg-gray-400 text-gray-800 h-8"
                                onClick={() => setOpenDropdown(task.id)}
                                tabIndex={0}
                                onBlur={() => setOpenDropdown(null)}
                            >
                                {task.dependencies.map((dep) => (
                                    <span
                                        key={dep}
                                        className="bg-gray-600 text-white px-2 py-1 mr-1 h-5 text-sm rounded inline-flex items-center"
                                    >
                                        {dep}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                actions.removeDependency(task.id, dep);
                                            }}
                                            className="ml-1 text-red-500 hover:text-red-700 text-xs"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                            {openDropdown === task.id && (
                                <div className="absolute bg-gray-400 text-gray-800 border mt-1 w-full max-h-40 overflow-y-auto z-50">
                                    {tasks
                                        .filter((t) => t.id !== task.id)
                                        .map((t) => (
                                            <div
                                                key={t.id}
                                                className="p-1 cursor-pointer hover:bg-gray-500"
                                                onMouseDown={(e) => e.preventDefault()}
                                                onClick={() => {
                                                    actions.addDependency(task.id, t.id);
                                                    setOpenDropdown(null);
                                                }}
                                            >
                                                {t.id}
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    )}
                    <button
                        onClick={() => actions.removeTask(task.id)}
                        className="bg-red-500 text-white px-1.5 py-0.5 rounded-md text-sm"
                    >
                        X
                    </button>
                </div>
            ))}
        </div>
    );
}
