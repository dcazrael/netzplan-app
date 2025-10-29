"use client";

import { TASK_TEMPLATES } from "@/constants/taskTemplates";
import { NetzplanActions } from "@/hooks/useNetzplan";
import { Task } from "@/types/task";
import { useEffect, useRef, useState } from "react";

type TaskInputProps = {
    tasks: Task[];
    actions: NetzplanActions;
};

/**
 * TaskInput with collapsible sidebar behavior (persisted via localStorage).
 */
export default function TaskInput({ tasks, actions }: TaskInputProps) {
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const [selectedTpl, setSelectedTpl] = useState<string>("");

    // Collapsed state with localStorage persistence
    const [collapsed, setCollapsed] = useState<boolean>(() => {
        if (typeof window === "undefined") return false;
        return localStorage.getItem("taskInputCollapsed") === "1";
    });

    useEffect(() => {
        try {
            localStorage.setItem("taskInputCollapsed", collapsed ? "1" : "0");
        } catch {}
    }, [collapsed]);

    const handleAddFromTemplate = (key: string) => {
        const tpl = TASK_TEMPLATES.find((t) => t.key === key);
        if (!tpl) return;
        actions.addTaskFromTemplate(tpl);
        setSelectedTpl(""); // reset
    };

    // Expanded full view
    return (
        <aside
            id="task-input-panel"
            className={`p-4 border rounded shrink-0 bg-gray-800 transition-[width] duration-500 ${
                collapsed ? "w-10" : "w-[35%]"
            }`}
            aria-label="Task-Eingabe"
        >
            {collapsed && (
                <div className="shrink-0 flex flex-col items-center gap-2" aria-label="Task-Eingabe eingeklappt">
                    <button
                        type="button"
                        onClick={() => setCollapsed(false)}
                        className="w-6 h-6 rounded bg-gray-700 hover:bg-gray-600 text-gray-100"
                        aria-expanded="false"
                        aria-controls="task-input-panel"
                        title="Task-Eingabe öffnen"
                    >
                        ›
                    </button>
                    <span className="text-gray-300 rotate-90 select-none mt-3 text-base">Tasks</span>
                </div>
            )}
            {!collapsed && (
                <div className="flex items-center justify-between mb-2">
                    <h2 className="font-bold text-lg text-center flex-1">Task-Eingabe</h2>
                    <button
                        type="button"
                        onClick={() => setCollapsed(true)}
                        className="ml-2 w-6 h-6 rounded bg-gray-700 hover:bg-gray-600 text-gray-100"
                        aria-expanded="true"
                        aria-controls="task-input-panel"
                        title="Task-Eingabe einklappen"
                    >
                        ‹
                    </button>
                </div>
            )}
            {/* Animierbarer Inhalt: Höhe (0fr -> 1fr) + Opacity */}
            <div
                className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out ${
                    collapsed ? "grid-rows-[0fr] opacity-0 pointer-events-none" : "grid-rows-[1fr] opacity-100"
                }`}
                aria-hidden={collapsed}
            >
                <div className={`${collapsed ? "overflow-hidden" : ""}`}>
                    <div className="flex items-center gap-2 mb-3 w-8/12 mx-auto">
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
                            className="bg-blue-500 text-white px-3 py-2 rounded-md h-8 flex items-center justify-center min-w-fit"
                            title="+ Leeren Task hinzufügen"
                        >
                            + Task
                        </button>
                    </div>

                    <div className="flex space-x-2 mb-2 items-center">
                        <span className="w-1/12 text-center font-bold">ID</span>
                        <span className="w-6/12 text-center font-bold">Task</span>
                        <span className="w-1/12 text-center font-bold">Dauer</span>
                        <span className="w-3/12 text-center font-bold">Abhängigkeit</span>
                        <span className="w-4"></span>
                    </div>

                    {tasks.map((task) => (
                        <div key={task.id} className="flex space-x-2 mb-2 items-center">
                            <span className="w-1/12 text-center font-bold">{task.id}</span>
                            <input
                                type="text"
                                className="border p-1 w-6/12 bg-gray-400 text-gray-800 h-8"
                                placeholder="Taskname"
                                value={task.name}
                                onChange={(e) => actions.updateName(task.id, e.target.value)}
                            />
                            <input
                                type="number"
                                className="border p-1 w-1/12 bg-gray-400 text-gray-800 h-8"
                                placeholder="Dauer"
                                value={task.duration}
                                min="1"
                                onChange={(e) => actions.updateDuration(task.id, Number(e.target.value))}
                            />
                            {task.id === 0 && <div className="relative w-3/12"></div>}
                            {task.id > 0 && (
                                <div className="relative w-3/12" ref={dropdownRef}>
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
            </div>
        </aside>
    );
}
